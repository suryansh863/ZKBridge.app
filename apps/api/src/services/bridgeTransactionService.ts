import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { bitcoinTestnetService } from './bitcoinTestnetService';
import { zkProofService } from './zkProofService';

const prisma = new PrismaClient();

export interface CreateBridgeTransactionInput {
  direction: 'BITCOIN_TO_ETHEREUM' | 'ETHEREUM_TO_BITCOIN';
  sourceTxHash: string;
  sourceAmount: string;
  sourceAddress: string;
  targetAddress: string;
  userId?: string;
  network?: string;
}

export interface UpdateBridgeTransactionInput {
  id: string;
  status?: string;
  targetTxHash?: string;
  zkProof?: any;
  zkProofHash?: string;
  merkleProof?: any;
  merkleRoot?: string;
  blockHeight?: number;
  blockHash?: string;
  confirmations?: number;
  errorMessage?: string;
  errorCount?: number;
}

export class BridgeTransactionService {
  /**
   * Create a new bridge transaction
   */
  async createTransaction(input: CreateBridgeTransactionInput) {
    try {
      const transaction = await prisma.bridgeTransaction.create({
        data: {
          direction: input.direction,
          sourceTxHash: input.sourceTxHash,
          sourceAmount: input.sourceAmount,
          sourceAddress: input.sourceAddress,
          targetAddress: input.targetAddress,
          userId: input.userId,
          network: input.network || 'testnet',
          status: 'PENDING',
        },
      });

      // Create initial event
      await this.createEvent(transaction.id, 'CREATED', {
        message: 'Bridge transaction created',
        sourceTxHash: input.sourceTxHash,
        direction: input.direction,
      });

      logger.info('Bridge transaction created', { transactionId: transaction.id });
      return transaction;
    } catch (error) {
      logger.error('Failed to create bridge transaction', { error });
      throw new Error('Failed to create bridge transaction');
    }
  }

  /**
   * Update bridge transaction
   */
  async updateTransaction(input: UpdateBridgeTransactionInput) {
    try {
      const updateData: any = {};

      if (input.status) updateData.status = input.status;
      if (input.targetTxHash) updateData.targetTxHash = input.targetTxHash;
      if (input.zkProof) updateData.zkProof = JSON.stringify(input.zkProof);
      if (input.zkProofHash) updateData.zkProofHash = input.zkProofHash;
      if (input.merkleProof) updateData.merkleProof = JSON.stringify(input.merkleProof);
      if (input.merkleRoot) updateData.merkleRoot = input.merkleRoot;
      if (input.blockHeight) updateData.blockHeight = input.blockHeight;
      if (input.blockHash) updateData.blockHash = input.blockHash;
      if (input.confirmations !== undefined) updateData.confirmations = input.confirmations;
      if (input.errorMessage) {
        updateData.errorMessage = input.errorMessage;
        updateData.errorCount = { increment: 1 };
      }

      const transaction = await prisma.bridgeTransaction.update({
        where: { id: input.id },
        data: updateData,
      });

      logger.info('Bridge transaction updated', { transactionId: input.id, status: input.status });
      return transaction;
    } catch (error) {
      logger.error('Failed to update bridge transaction', { error, transactionId: input.id });
      throw new Error('Failed to update bridge transaction');
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string) {
    try {
      const transaction = await prisma.bridgeTransaction.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    } catch (error) {
      logger.error('Failed to get transaction', { error, transactionId: id });
      throw new Error('Failed to get transaction');
    }
  }

  /**
   * Get transaction by source hash
   */
  async getTransactionBySourceHash(sourceTxHash: string) {
    try {
      return await prisma.bridgeTransaction.findUnique({
        where: { sourceTxHash },
        include: { user: true },
      });
    } catch (error) {
      logger.error('Failed to get transaction by source hash', { error, sourceTxHash });
      throw new Error('Failed to get transaction');
    }
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userId: string, limit = 50, offset = 0) {
    try {
      const transactions = await prisma.bridgeTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.bridgeTransaction.count({
        where: { userId },
      });

      return { transactions, total };
    } catch (error) {
      logger.error('Failed to get user transactions', { error, userId });
      throw new Error('Failed to get user transactions');
    }
  }

  /**
   * Get all transactions with filters
   */
  async getAllTransactions(filters: {
    status?: string;
    direction?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.direction) where.direction = filters.direction;

      const transactions = await prisma.bridgeTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
        include: { user: true },
      });

      const total = await prisma.bridgeTransaction.count({ where });

      return { transactions, total };
    } catch (error) {
      logger.error('Failed to get all transactions', { error });
      throw new Error('Failed to get all transactions');
    }
  }

  /**
   * Process Bitcoin to Ethereum bridge
   */
  async processBitcoinToEthereum(transactionId: string) {
    try {
      const transaction = await this.getTransaction(transactionId);

      // Step 1: Verify Bitcoin transaction
      await this.updateTransaction({
        id: transactionId,
        status: 'VERIFYING',
      });
      await this.createEvent(transactionId, 'VERIFYING', {
        message: 'Verifying Bitcoin transaction',
      });

      const btcTx = await bitcoinTestnetService.getTransaction(transaction.sourceTxHash);
      
      if (!btcTx.status.confirmed) {
        throw new Error('Bitcoin transaction not confirmed');
      }

      // Step 2: Generate Merkle proof
      await this.createEvent(transactionId, 'GENERATING_MERKLE_PROOF', {
        message: 'Generating Merkle proof',
      });

      const merkleProof = await bitcoinTestnetService.generateMerkleProof(transaction.sourceTxHash);

      await this.updateTransaction({
        id: transactionId,
        merkleProof: merkleProof,
        merkleRoot: merkleProof.merkleRoot,
        blockHeight: merkleProof.blockHeight,
        blockHash: merkleProof.blockHash,
      });

      // Step 3: Generate ZK proof
      await this.createEvent(transactionId, 'GENERATING_ZK_PROOF', {
        message: 'Generating Zero-Knowledge proof',
      });

      const zkProof = await zkProofService.generateProof({
        transactionHash: transaction.sourceTxHash,
        merkleProof: merkleProof.proofPath,
        merkleRoot: merkleProof.merkleRoot,
        blockHeight: merkleProof.blockHeight,
      });

      await this.updateTransaction({
        id: transactionId,
        zkProof: zkProof,
        zkProofHash: zkProof.proofHash,
        status: 'PROOF_GENERATED',
      });

      await this.createEvent(transactionId, 'PROOF_GENERATED', {
        message: 'Zero-Knowledge proof generated successfully',
        proofHash: zkProof.proofHash,
      });

      logger.info('Bitcoin to Ethereum bridge processed', { transactionId });
      return await this.getTransaction(transactionId);
    } catch (error) {
      logger.error('Failed to process Bitcoin to Ethereum bridge', { error, transactionId });
      
      await this.updateTransaction({
        id: transactionId,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.createEvent(transactionId, 'FAILED', {
        message: 'Bridge processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Create transaction event
   */
  async createEvent(transactionId: string, eventType: string, data: any) {
    try {
      await prisma.transactionEvent.create({
        data: {
          transactionId,
          eventType,
          eventData: JSON.stringify(data),
          message: data.message || '',
        },
      });
    } catch (error) {
      logger.error('Failed to create transaction event', { error, transactionId, eventType });
    }
  }

  /**
   * Get transaction events
   */
  async getTransactionEvents(transactionId: string) {
    try {
      return await prisma.transactionEvent.findMany({
        where: { transactionId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      logger.error('Failed to get transaction events', { error, transactionId });
      throw new Error('Failed to get transaction events');
    }
  }

  /**
   * Get transaction statistics
   */
  async getStatistics() {
    try {
      const total = await prisma.bridgeTransaction.count();
      const pending = await prisma.bridgeTransaction.count({ where: { status: 'PENDING' } });
      const completed = await prisma.bridgeTransaction.count({ where: { status: 'COMPLETED' } });
      const failed = await prisma.bridgeTransaction.count({ where: { status: 'FAILED' } });

      const totalVolume = await prisma.bridgeTransaction.aggregate({
        _sum: { sourceAmount: true },
        where: { status: 'COMPLETED' },
      });

      return {
        total,
        pending,
        completed,
        failed,
        totalVolume: totalVolume._sum.sourceAmount || '0',
      };
    } catch (error) {
      logger.error('Failed to get statistics', { error });
      throw new Error('Failed to get statistics');
    }
  }
}

export const bridgeTransactionService = new BridgeTransactionService();
