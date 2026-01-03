import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import * as crypto from 'crypto';

// Bitcoin testnet network configuration
const TESTNET = bitcoin.networks.testnet;

// Blockstream testnet API endpoints
const BLOCKSTREAM_API_BASE = 'https://blockstream.info/testnet/api';

export interface BitcoinTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address: string;
      value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    witness?: string[];
    is_coinbase: boolean;
    sequence: number;
  }>;
  vout: Array<{
    value: number;
    n: number;
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface BitcoinBlock {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  bits: number;
  nonce: number;
  merkle_root: string;
  previousblockhash: string;
  tx_count: number;
  size: number;
  weight: number;
  fee: number;
  hash?: string;
  nextblockhash?: string;
}

export interface MerkleProof {
  merkleRoot: string;
  proofPath: string[];
  proofIndex: number;
  transactionHash: string;
  blockHeight: number;
  blockHash: string;
}

export class BitcoinTestnetService {
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes for better performance


  /**
   * Validate Bitcoin transaction hash
   */
  validateTransactionHash(txHash: string): boolean {
    return /^[a-fA-F0-9]{64}$/.test(txHash);
  }

  /**
   * Get transaction details from Blockstream API
   */
  async getTransaction(txHash: string): Promise<BitcoinTransaction> {
    const cacheKey = `tx_${txHash}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BLOCKSTREAM_API_BASE}/tx/${txHash}`);
      const tx = response.data;

      this.setCache(cacheKey, tx);
      return tx;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Transaction ${txHash} not found on Bitcoin testnet`);
      }
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  /**
   * Get block details from Blockstream API
   */
  async getBlock(blockHash: string): Promise<BitcoinBlock> {
    const cacheKey = `block_${blockHash}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BLOCKSTREAM_API_BASE}/block/${blockHash}`);
      const block = response.data;

      this.setCache(cacheKey, block);
      return block;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Block ${blockHash} not found`);
      }
      throw new Error(`Failed to fetch block: ${error.message}`);
    }
  }

  /**
   * Get block by height
   */
  async getBlockByHeight(height: number): Promise<BitcoinBlock> {
    const cacheKey = `block_height_${height}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BLOCKSTREAM_API_BASE}/block-height/${height}`);
      const blockHash = response.data;
      const block = await this.getBlock(blockHash);

      this.setCache(cacheKey, block);
      return block;
    } catch (error: any) {
      throw new Error(`Failed to fetch block at height ${height}: ${error.message}`);
    }
  }

  /**
   * Get all transaction hashes in a block
   */
  async getBlockTransactions(blockHash: string): Promise<string[]> {
    const cacheKey = `block_txs_${blockHash}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BLOCKSTREAM_API_BASE}/block/${blockHash}/txids`);
      const txids = response.data;

      this.setCache(cacheKey, txids);
      return txids;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Block transactions not found for block ${blockHash}`);
      }
      throw new Error(`Failed to fetch block transactions: ${error.message}`);
    }
  }

  /**
   * Generate Merkle proof for a transaction
   */
  async generateMerkleProof(txHash: string): Promise<MerkleProof> {
    try {
      const tx = await this.getTransaction(txHash);
      if (!tx.status.confirmed || !tx.status.block_hash) {
        throw new Error('Transaction must be confirmed to generate a Merkle proof');
      }

      const txids = await this.getBlockTransactions(tx.status.block_hash);
      const block = await this.getBlock(tx.status.block_hash);

      const txIndex = txids.indexOf(txHash);
      if (txIndex === -1) {
        throw new Error('Transaction not found in its reported block');
      }

      // Use shared logic for proof generation
      // Importing locally to avoid circular dependencies if any, 
      // though typically shared is a separate layer.
      const { generateMerkleProof: sharedGenerateProof } = require('@zkbridge/shared');
      const proof = sharedGenerateProof(txids, txHash);

      return {
        merkleRoot: proof.root,
        proofPath: proof.path,
        proofIndex: txIndex,
        transactionHash: txHash,
        blockHeight: tx.status.block_height!,
        blockHash: tx.status.block_hash
      };
    } catch (error: any) {
      throw new Error(`Failed to generate Merkle proof: ${error.message}`);
    }
  }

  /**
   * Double SHA256 hash (deprecated in favor of shared utility, but kept for internal use)
   */
  private doubleSha256(input: string): string {
    const { doubleSha256: sharedDoubleSha256 } = require('@zkbridge/shared');
    return sharedDoubleSha256(input);
  }

  /**
   * Verify Merkle proof
   */
  verifyMerkleProof(proof: MerkleProof): boolean {
    const { verifyMerkleProof: sharedVerifyProof } = require('@zkbridge/shared');
    return sharedVerifyProof(
      proof.transactionHash,
      proof.proofPath,
      // Convert indices from path side if needed, but our shared logic uses 1/0 for right/left.
      // We need to ensure proofIndex bits correspond to the path sides.
      new Array(proof.proofPath.length).fill(0).map((_, i) => (proof.proofIndex >> i) & 1),
      proof.merkleRoot
    );
  }


  /**
   * Get transaction confirmation count
   */
  async getConfirmationCount(txHash: string): Promise<number> {
    try {
      const tx = await this.getTransaction(txHash);

      if (!tx.status.confirmed) {
        return 0;
      }

      const currentHeight = await this.getBlockCount();
      return currentHeight - tx.status.block_height! + 1;
    } catch (error: any) {
      throw new Error(`Failed to get confirmation count: ${error.message}`);
    }
  }

  /**
   * Get current block count (height)
   */
  async getBlockCount(): Promise<number> {
    try {
      const response = await axios.get(`${BLOCKSTREAM_API_BASE}/blocks/tip/height`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get block count: ${error.message}`);
    }
  }

  /**
   * Get network info
   */
  async getNetworkInfo(): Promise<any> {
    try {
      const height = await this.getBlockCount();
      // Blockstream doesn't provide a single 'network info' endpoint like bitcoind,
      // but we can aggregate some data.
      return {
        network: 'testnet',
        chain: 'bitcoin',
        blocks: height,
        difficulty: 0, // Not easily available via Blockstream without block parsing
        timestamp: Math.floor(Date.now() / 1000)
      };
    } catch (error: any) {
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }

  /**
   * Get balance for an address
   */
  async getBalance(address: string): Promise<number> {
    try {
      const response = await axios.get(`${BLOCKSTREAM_API_BASE}/address/${address}`);
      const { chain_stats, mempool_stats } = response.data;

      const confirmed = (chain_stats.funded_txo_sum - chain_stats.spent_txo_sum) / 100000000;
      const unconfirmed = (mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum) / 100000000;

      return confirmed + unconfirmed;
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Validate Bitcoin address
   */
  validateAddress(address: string): boolean {
    const testnetRegex = /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const testnetBech32Regex = /^tb1[a-z0-9]{39,59}$/;
    return testnetRegex.test(address) || testnetBech32Regex.test(address);
  }

  /**
   * Cache management
   */
  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const bitcoinTestnetService = new BitcoinTestnetService();

