import Client from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import axios from 'axios';
import { BitcoinTransaction, MerkleProof } from '../types';
import { verifyMerkleProof } from '../types';
// import { generateMerkleProof } from '../types'; // Unused for now
import { logger } from '../utils/logger';
import { bitcoinTestnetService, BitcoinTransaction as TestnetTransaction, MerkleProof as TestnetMerkleProof } from './bitcoinTestnetService';

// Bitcoin testnet configuration
// const TESTNET_CONFIG = { // Unused for now
//   messagePrefix: '\x18Bitcoin Signed Message:\n',
//   bech32: 'tb',
//   bip32: {
//     public: 0x043587cf,
//     private: 0x04358394,
//   },
//   pubKeyHash: 0x6f,
//   scriptHash: 0xc4,
//   wif: 0xef,
// };

export class BitcoinService {
  private client: Client;
  private network: bitcoin.Network;
  private blockstreamApiUrl: string;

  constructor() {
    // Configure Bitcoin testnet
    this.network = bitcoin.networks.testnet;
    
    // Initialize Bitcoin Core client
    this.client = new Client({
      network: process.env.BITCOIN_NETWORK || 'testnet',
      username: process.env.BITCOIN_RPC_USER || 'bitcoin',
      password: process.env.BITCOIN_RPC_PASSWORD || 'password',
      port: parseInt(process.env.BITCOIN_RPC_PORT || '18332'),
      host: process.env.BITCOIN_RPC_HOST || 'localhost',
    });

    // Blockstream API for testnet
    this.blockstreamApiUrl = process.env.BITCOIN_API_URL || 'https://blockstream.info/testnet/api';
  }

  async getTransaction(txid: string): Promise<BitcoinTransaction> {
    try {
      // Use the new testnet service for real Bitcoin data
      const testnetTx = await bitcoinTestnetService.getTransaction(txid);
      const confirmations = await bitcoinTestnetService.getConfirmationCount(txid);
      
      // Calculate amount from outputs for outputs array
      
      return {
        txHash: testnetTx.txid,
        blockHash: testnetTx.status.block_hash || '',
        blockHeight: testnetTx.status.block_height || 0,
        confirmations,
        inputs: testnetTx.vin.map(input => ({
          address: input.prevout.scriptpubkey_address || '',
          amount: input.prevout.value || 0,
          txHash: input.txid || '',
          outputIndex: input.vout || 0
        })),
        outputs: testnetTx.vout.map(output => ({
          address: output.scriptpubkey_address || '',
          amount: output.value || 0,
          scriptPubKey: output.scriptpubkey || ''
        })),
        fee: testnetTx.fee || 0,
        timestamp: testnetTx.status.block_time || Math.floor(Date.now() / 1000)
      };
    } catch (error: any) {
      logger.error('Error getting Bitcoin transaction:', error);
      throw new Error(`Failed to get Bitcoin transaction: ${error.message}`);
    }
  }

  private calculateTransactionAmount(tx: any): number {
    // Calculate total output amount in satoshis
    if (tx.vout) {
      return tx.vout.reduce((total: number, output: any) => {
        return total + (output.value ? Math.round(output.value * 100000000) : 0);
      }, 0);
    }
    return 0;
  }

  private extractInputAddresses(tx: any): string[] {
    const addresses: string[] = [];
    if (tx.vin) {
      tx.vin.forEach((input: any) => {
        if (input.prevout?.scriptpubkey_address) {
          addresses.push(input.prevout.scriptpubkey_address);
        }
      });
    }
    return addresses;
  }

  private extractOutputAddresses(tx: any): string[] {
    const addresses: string[] = [];
    if (tx.vout) {
      tx.vout.forEach((output: any) => {
        if (output.scriptpubkey_address) {
          addresses.push(output.scriptpubkey_address);
        }
      });
    }
    return addresses;
  }

  async verifyTransaction(txid: string, address: string, amount: number): Promise<{
    isValid: boolean;
    details: any;
  }> {
    try {
      const tx = await this.getTransaction(txid);
      
      // Validate transaction format
      if (!this.validateTransactionFormat(tx)) {
        return { isValid: false, details: { error: 'Invalid transaction format' } };
      }

      // Check if the transaction involves the specified address
      const inputAddresses = await this.getInputAddresses(txid);
      const outputAddresses = await this.getOutputAddresses(txid);
      
      const isCorrectAddress = 
        inputAddresses.includes(address) || 
        outputAddresses.includes(address);
      
      // Check amount with tolerance (allow for fees)
      const totalOutputAmount = tx.outputs.reduce((sum, output) => sum + output.amount, 0);
      const tolerance = Math.max(1000, Math.floor(amount * 0.01)); // 1% tolerance or 1000 sats minimum
      const isCorrectAmount = Math.abs(totalOutputAmount - amount) <= tolerance;
      
      // Check confirmations
      const hasEnoughConfirmations = tx.confirmations >= 6; // 6 confirmations for security
      
      const isValid = isCorrectAddress && isCorrectAmount && hasEnoughConfirmations;
      
      return {
        isValid,
        details: {
          transaction: tx,
          inputAddresses,
          outputAddresses,
          confirmations: tx.confirmations,
          amountMatch: isCorrectAmount,
          addressMatch: isCorrectAddress,
          sufficientConfirmations: hasEnoughConfirmations
        }
      };
    } catch (error: any) {
      logger.error('Error verifying Bitcoin transaction:', error);
      return { isValid: false, details: { error: error.message } };
    }
  }

  private validateTransactionFormat(tx: BitcoinTransaction): boolean {
    const totalAmount = tx.outputs.reduce((sum, output) => sum + output.amount, 0);
    return !!(tx.txHash && totalAmount > 0 && (tx.inputs.length > 0 || tx.outputs.length > 0));
  }

  private async getInputAddresses(txid: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.blockstreamApiUrl}/tx/${txid}`);
      const tx = response.data;
      
      const addresses: string[] = [];
      if (tx.vin) {
        for (const input of tx.vin) {
          if (input.prevout?.scriptpubkey_address) {
            addresses.push(input.prevout.scriptpubkey_address);
          }
        }
      }
      return addresses;
    } catch (error: any) {
      logger.error('Error getting input addresses:', error);
      return [];
    }
  }

  private async getOutputAddresses(txid: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.blockstreamApiUrl}/tx/${txid}`);
      const tx = response.data;
      
      const addresses: string[] = [];
      if (tx.vout) {
        for (const output of tx.vout) {
          if (output.scriptpubkey_address) {
            addresses.push(output.scriptpubkey_address);
          }
        }
      }
      return addresses;
    } catch (error: any) {
      logger.error('Error getting output addresses:', error);
      return [];
    }
  }

  async generateMerkleProof(txid: string, _blockHash?: string): Promise<MerkleProof> {
    try {
      // Use the new testnet service for real Merkle proof generation
      const testnetProof = await bitcoinTestnetService.generateMerkleProof(txid);
      
      return {
        leaf: testnetProof.transactionHash,
        path: testnetProof.proofPath,
        indices: [testnetProof.proofIndex], // Convert to array format expected by existing code
        root: testnetProof.merkleRoot
      };
    } catch (error: any) {
      logger.error('Error generating Merkle proof:', error);
      throw new Error(`Failed to generate Merkle proof: ${error.message}`);
    }
  }

  async verifyMerkleProof(proof: MerkleProof): Promise<boolean> {
    try {
      return verifyMerkleProof(proof.leaf, proof.path, proof.indices, proof.root);
    } catch (error: any) {
      logger.error('Error verifying Merkle proof:', error);
      return false;
    }
  }

  async getNetworkInfo(): Promise<any> {
    try {
      const info = await this.client.getNetworkInfo();
      return {
        version: info.version,
        subversion: info.subversion,
        protocolversion: info.protocolversion,
        connections: info.connections,
        networkactive: info.networkactive,
        networks: info.networks
      };
    } catch (error: any) {
      logger.error('Error getting Bitcoin network info:', error);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      // Note: This is a simplified implementation
      // In a real application, you'd need to track UTXOs for the address
      const unspent = await this.client.listUnspent(0, 9999999, [address]);
      const balance = unspent.reduce((sum: number, utxo: any) => sum + utxo.amount, 0);
      return balance * 100000000; // Convert to satoshis
    } catch (error: any) {
      logger.error('Error getting Bitcoin balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getBlockCount(): Promise<number> {
    try {
      return await this.client.getBlockCount();
    } catch (error: any) {
      logger.error('Error getting block count:', error);
      throw new Error(`Failed to get block count: ${error.message}`);
    }
  }

  async getBlockHash(height: number): Promise<string> {
    try {
      return await this.client.getBlockHash(height);
    } catch (error: any) {
      logger.error('Error getting block hash:', error);
      throw new Error(`Failed to get block hash: ${error.message}`);
    }
  }

  /**
   * Validate Bitcoin testnet address
   */
  validateAddress(address: string): boolean {
    return bitcoinTestnetService.validateAddress(address);
  }

  /**
   * Validate Bitcoin transaction hash
   */
  validateTransactionHash(txHash: string): boolean {
    return bitcoinTestnetService.validateTransactionHash(txHash);
  }

  /**
   * Get sample transactions for demo
   */
  async getSampleTransactions(): Promise<Array<{txHash: string, description: string}>> {
    return await bitcoinTestnetService.getSampleTransactions();
  }

  /**
   * Get detailed transaction information with all inputs/outputs
   */
  async getDetailedTransaction(txid: string): Promise<TestnetTransaction> {
    return await bitcoinTestnetService.getTransaction(txid);
  }

  /**
   * Generate detailed Merkle proof with block information
   */
  async getDetailedMerkleProof(txid: string): Promise<TestnetMerkleProof> {
    return await bitcoinTestnetService.generateMerkleProof(txid);
  }
}
