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
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate Bitcoin testnet address
   */
  validateAddress(address: string): boolean {
    try {
      bitcoin.address.toOutputScript(address, TESTNET);
      return true;
    } catch (error) {
      return false;
    }
  }

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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Transaction not found');
      }
      throw new Error(`Failed to fetch transaction: ${error}`);
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
    } catch (error) {
      throw new Error(`Failed to fetch block: ${error}`);
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
    } catch (error) {
      throw new Error(`Failed to fetch block at height ${height}: ${error}`);
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
    } catch (error) {
      throw new Error(`Failed to fetch block transactions: ${error}`);
    }
  }

  /**
   * Generate Merkle proof for a transaction
   */
  async generateMerkleProof(txHash: string): Promise<MerkleProof> {
    try {
      // Get transaction details
      const tx = await this.getTransaction(txHash);
      
      if (!tx.status.confirmed) {
        throw new Error('Transaction is not confirmed');
      }

      const blockHeight = tx.status.block_height!;
      const blockHash = tx.status.block_hash!;

      // Get block details
      const block = await this.getBlock(blockHash);
      
      // Get all transaction hashes in the block
      const txHashes = await this.getBlockTransactions(blockHash);
      
      // Find transaction index in the block
      const txIndex = txHashes.findIndex(hash => hash === txHash);
      if (txIndex === -1) {
        throw new Error('Transaction not found in block');
      }

      // Generate Merkle proof
      const proofPath = this.calculateMerkleProof(txHashes, txIndex);
      
      return {
        merkleRoot: block.merkle_root,
        proofPath,
        proofIndex: txIndex,
        transactionHash: txHash,
        blockHeight,
        blockHash
      };
    } catch (error) {
      throw new Error(`Failed to generate Merkle proof: ${error}`);
    }
  }

  /**
   * Calculate Merkle proof path for a transaction
   */
  private calculateMerkleProof(txHashes: string[], txIndex: number): string[] {
    const proof: string[] = [];
    let currentHashes = [...txHashes];
    let currentIndex = txIndex;

    while (currentHashes.length > 1) {
      const nextHashes: string[] = [];
      
      for (let i = 0; i < currentHashes.length; i += 2) {
        const left = currentHashes[i];
        const right = currentHashes[i + 1] || left; // Duplicate if odd number
        
        // Add the sibling to proof if current transaction is in this pair
        if (i === currentIndex || i === currentIndex - 1) {
          if (i === currentIndex) {
            // Current is left, add right as proof
            proof.push(right);
          } else {
            // Current is right, add left as proof
            proof.push(left);
          }
        }
        
        // Calculate parent hash
        const parentHash = this.doubleSha256(left + right);
        nextHashes.push(parentHash);
      }
      
      currentHashes = nextHashes;
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }

  /**
   * Double SHA256 hash
   */
  private doubleSha256(input: string): string {
    const hash1 = crypto.createHash('sha256').update(Buffer.from(input, 'hex')).digest();
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    return hash2.toString('hex');
  }

  /**
   * Verify Merkle proof
   */
  verifyMerkleProof(proof: MerkleProof): boolean {
    try {
      let currentHash = proof.transactionHash;
      
      for (let i = 0; i < proof.proofPath.length; i++) {
        const sibling = proof.proofPath[i];
        const isLeft = (((proof.proofIndex >> i) & 1) === 0);
        
        if (isLeft) {
          currentHash = this.doubleSha256(currentHash + sibling);
        } else {
          currentHash = this.doubleSha256(sibling + currentHash);
        }
      }
      
      return currentHash === proof.merkleRoot;
    } catch (error) {
      return false;
    }
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

      // Get current block height
      const currentBlockResponse = await axios.get(`${BLOCKSTREAM_API_BASE}/blocks/tip/height`);
      const currentHeight = currentBlockResponse.data;
      
      return currentHeight - tx.status.block_height! + 1;
    } catch (error) {
      throw new Error(`Failed to get confirmation count: ${error}`);
    }
  }

  /**
   * Get real testnet transactions from recent blocks for demo
   */
  async getSampleTransactions(): Promise<Array<{txHash: string, description: string}>> {
    const cacheKey = 'sample_transactions';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Get the latest block height
      const tipHeightResponse = await axios.get(`${BLOCKSTREAM_API_BASE}/blocks/tip/height`);
      const tipHeight = tipHeightResponse.data;
      
      // Get a recent block (not the very latest to ensure confirmations)
      const targetHeight = tipHeight - 10; // Go back 10 blocks
      const blockHashResponse = await axios.get(`${BLOCKSTREAM_API_BASE}/block-height/${targetHeight}`);
      const blockHash = blockHashResponse.data;
      
      // Get transactions from this block
      const txsResponse = await axios.get(`${BLOCKSTREAM_API_BASE}/block/${blockHash}/txs`);
      const transactions = txsResponse.data;
      
      // Filter and format sample transactions (skip coinbase, take first 4 regular txs)
      const sampleTxs = transactions
        .filter((tx: any) => !tx.vin[0].is_coinbase)
        .slice(0, 4)
        .map((tx: any) => ({
          txHash: tx.txid,
          description: `✅ Real testnet transaction - ${(tx.vout.reduce((sum: number, out: any) => sum + out.value, 0) / 100000000).toFixed(8)} BTC (Block ${targetHeight})`
        }));
      
      // If we don't have enough real transactions, add some fallback guidance
      if (sampleTxs.length === 0) {
        return [{
          txHash: '',
          description: '🔍 Visit https://blockstream.info/testnet/ to find recent testnet transactions'
        }];
      }
      
      this.setCache(cacheKey, sampleTxs);
      return sampleTxs;
    } catch (error) {
      console.error('Failed to fetch real sample transactions:', error);
      // Fallback to helpful guidance
      return [
        {
          txHash: '',
          description: '🔍 Visit https://blockstream.info/testnet/ to find real testnet transactions'
        },
        {
          txHash: '',
          description: '💡 Click on any recent transaction to copy its ID'
        },
        {
          txHash: '',
          description: '📋 Paste the transaction ID above to test the bridge'
        }
      ];
    }
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

