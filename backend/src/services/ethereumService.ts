import { ethers } from 'ethers';
import { EthereumTransaction } from '../types';
import { logger } from '../utils/logger';

export class EthereumService {
  private provider: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (process.env.ETHEREUM_PRIVATE_KEY && process.env.ETHEREUM_PRIVATE_KEY !== 'your_private_key_here') {
      try {
        this.wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, this.provider);
      } catch (error) {
        logger.warn('Invalid ETHEREUM_PRIVATE_KEY, wallet not initialized');
      }
    }
  }

  async getTransaction(hash: string): Promise<EthereumTransaction> {
    try {
      const tx = await this.provider.getTransaction(hash);
      if (!tx) {
        throw new Error('Transaction not found');
      }

      const receipt = await this.provider.getTransactionReceipt(hash);
      const block = tx.blockNumber ? await this.provider.getBlock(tx.blockNumber) : null;

      return {
        hash: tx.hash,
        amount: tx.value.toString(),
        fromAddress: tx.from,
        toAddress: tx.to || '',
        blockNumber: tx.blockNumber || undefined,
        confirmations: tx.blockNumber ? await this.provider.getBlockNumber() - tx.blockNumber + 1 : 0,
        timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
        gasUsed: receipt?.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error) {
      logger.error('Error getting Ethereum transaction:', error);
      throw new Error(`Failed to get Ethereum transaction: ${error.message}`);
    }
  }

  async verifyTransaction(hash: string, address: string, amount: string): Promise<boolean> {
    try {
      const tx = await this.getTransaction(hash);
      
      // Check if the transaction involves the specified address and amount
      const isCorrectAddress = tx.fromAddress.toLowerCase() === address.toLowerCase() || 
                              tx.toAddress.toLowerCase() === address.toLowerCase();
      const isCorrectAmount = tx.amount === amount;
      
      return isCorrectAddress && isCorrectAmount;
    } catch (error) {
      logger.error('Error verifying Ethereum transaction:', error);
      return false;
    }
  }

  async getNetworkInfo(): Promise<any> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        gasPrice: gasPrice.toString()
      };
    } catch (error) {
      logger.error('Error getting Ethereum network info:', error);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      logger.error('Error getting Ethereum balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw new Error(`Failed to get gas price: ${error.message}`);
    }
  }

  async estimateGas(transaction: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : undefined,
        data: transaction.data
      });
      return gasEstimate.toString();
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }

  async sendTransaction(transaction: {
    to: string;
    value: string;
    data?: string;
  }): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not configured');
    }

    try {
      const tx = await this.wallet.sendTransaction({
        to: transaction.to,
        value: ethers.parseEther(transaction.value),
        data: transaction.data
      });

      return tx.hash;
    } catch (error) {
      logger.error('Error sending transaction:', error);
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  async getBlock(blockNumber: number): Promise<any> {
    try {
      const block = await this.provider.getBlock(blockNumber);
      return {
        number: block?.number,
        hash: block?.hash,
        parentHash: block?.parentHash,
        timestamp: block?.timestamp,
        transactions: block?.transactions
      };
    } catch (error) {
      logger.error('Error getting block:', error);
      throw new Error(`Failed to get block: ${error.message}`);
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting block number:', error);
      throw new Error(`Failed to get block number: ${error.message}`);
    }
  }
}

