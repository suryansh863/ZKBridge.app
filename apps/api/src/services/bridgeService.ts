import { PrismaClient } from '@prisma/client';
import { bitcoinTestnetService } from './bitcoinTestnetService';
import { EthereumService } from './ethereumService';
import { ZKProofService } from './zkProofService';
import { logger } from '../utils/logger';
import { BitcoinTransaction, MerkleProof } from './bitcoinTestnetService';

export interface BridgeInitiationData {
  fromChain: 'bitcoin' | 'ethereum';
  toChain: 'bitcoin' | 'ethereum';
  sourceTxHash: string;
  sourceAmount: string;
  sourceAddress: string;
  targetAddress: string;
  userId?: string;
}

export interface BridgeStatus {
  id: string;
  status: string;
  fromChain: string;
  toChain: string;
  sourceTxHash: string;
  targetTxHash?: string;
  amount: string;
  confirmations: number;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export class BridgeService {
  private prisma: PrismaClient;
  private ethereumService: EthereumService;
  private zkProofService: ZKProofService;

  constructor() {
    this.prisma = new PrismaClient();
    this.ethereumService = new EthereumService();
    this.zkProofService = new ZKProofService();
  }

  async initiateBridge(data: BridgeInitiationData): Promise<BridgeStatus> {
    try {
      logger.info('Initiating bridge transaction', { data });

      // Validate input data
      this.validateBridgeData(data);

      // Create bridge transaction record
      const bridgeTx = await this.prisma.bridgeTransaction.create({
        data: {
          direction: this.getBridgeDirection(data.fromChain, data.toChain),
          status: 'PENDING',
          sourceTxHash: data.sourceTxHash,
          sourceAmount: data.sourceAmount,
          sourceAddress: data.sourceAddress,
          targetAddress: data.targetAddress,
          userId: data.userId,
          confirmations: 0
        }
      });

      logger.info('Bridge transaction created', { id: bridgeTx.id });

      // Start async verification process
      this.verifySourceTransaction(bridgeTx.id).catch(error => {
        logger.error('Error in async verification:', error);
      });

      return {
        id: bridgeTx.id,
        status: bridgeTx.status,
        fromChain: data.fromChain,
        toChain: data.toChain,
        sourceTxHash: bridgeTx.sourceTxHash,
        amount: bridgeTx.sourceAmount,
        confirmations: bridgeTx.confirmations,
        createdAt: bridgeTx.createdAt,
        updatedAt: bridgeTx.updatedAt
      };
    } catch (error) {
      logger.error('Error initiating bridge:', error);
      throw new Error(`Failed to initiate bridge: ${error.message}`);
    }
  }

  async getBridgeStatus(txId: string): Promise<BridgeStatus> {
    try {
      const bridgeTx = await this.prisma.bridgeTransaction.findUnique({
        where: { id: txId }
      });

      if (!bridgeTx) {
        throw new Error('Bridge transaction not found');
      }

      return {
        id: bridgeTx.id,
        status: bridgeTx.status,
        fromChain: this.getChainName(bridgeTx.direction, 'from'),
        toChain: this.getChainName(bridgeTx.direction, 'to'),
        sourceTxHash: bridgeTx.sourceTxHash,
        targetTxHash: bridgeTx.targetTxHash || undefined,
        amount: bridgeTx.sourceAmount,
        confirmations: bridgeTx.confirmations,
        createdAt: bridgeTx.createdAt,
        updatedAt: bridgeTx.updatedAt
      };
    } catch (error) {
      logger.error('Error getting bridge status:', error);
      throw new Error(`Failed to get bridge status: ${error.message}`);
    }
  }

  async verifySourceTransaction(bridgeTxId: string): Promise<void> {
    try {
      const bridgeTx = await this.prisma.bridgeTransaction.findUnique({
        where: { id: bridgeTxId }
      });

      if (!bridgeTx) {
        throw new Error('Bridge transaction not found');
      }

      logger.info('Verifying source transaction', { bridgeTxId, sourceTxHash: bridgeTx.sourceTxHash });

      // Update status to processing
      await this.updateBridgeStatus(bridgeTxId, 'PROCESSING');

      // Verify based on source chain
      let verificationResult;
      if (bridgeTx.direction === 'BITCOIN_TO_ETHEREUM') {
        // Verify Bitcoin transaction using testnet service
        const bitcoinTx = await bitcoinTestnetService.getTransaction(bridgeTx.sourceTxHash);
        const confirmations = await bitcoinTestnetService.getConfirmationCount(bridgeTx.sourceTxHash);
        verificationResult = {
          isValid: bitcoinTx.status.confirmed && confirmations > 0,
          transaction: bitcoinTx,
          confirmations
        };
      } else {
        verificationResult = await this.ethereumService.verifyTransaction(
          bridgeTx.sourceTxHash,
          bridgeTx.sourceAddress,
          bridgeTx.sourceAmount
        );
      }

      if (!verificationResult.isValid) {
        await this.updateBridgeStatus(bridgeTxId, 'FAILED', 'Source transaction verification failed');
        return;
      }

      // Update confirmations
      await this.updateBridgeConfirmations(bridgeTxId, verificationResult.confirmations || 0);

      // Wait for sufficient confirmations
      if (verificationResult.confirmations < 6) {
        logger.info('Waiting for more confirmations', { 
          bridgeTxId, 
          confirmations: verificationResult.confirmations 
        });
        return;
      }

      // Generate ZK proof
      await this.generateAndStoreZKProof(bridgeTxId);

      // Update status to confirmed
      await this.updateBridgeStatus(bridgeTxId, TransactionStatus.CONFIRMED);

      // Start target chain transaction
      await this.initiateTargetTransaction(bridgeTxId);

    } catch (error) {
      logger.error('Error verifying source transaction:', error);
      await this.updateBridgeStatus(bridgeTxId, TransactionStatus.FAILED, error.message);
    }
  }

  async generateAndStoreZKProof(bridgeTxId: string): Promise<void> {
    try {
      const bridgeTx = await this.prisma.bridgeTransaction.findUnique({
        where: { id: bridgeTxId }
      });

      if (!bridgeTx) {
        throw new Error('Bridge transaction not found');
      }

      logger.info('Generating ZK proof for bridge transaction', { bridgeTxId });

      // Prepare proof data
      const proofData = {
        bitcoinTxHash: bridgeTx.sourceTxHash,
        bitcoinAmount: bridgeTx.sourceAmount,
        ethereumAddress: bridgeTx.targetAddress,
        ethereumAmount: bridgeTx.targetAmount || bridgeTx.sourceAmount
      };

      // Generate ZK proof
      const zkProof = await this.zkProofService.generateBridgeProof(proofData, {
        address: bridgeTx.targetAddress,
        amount: bridgeTx.targetAmount || bridgeTx.sourceAmount
      });

      // Store proof in database
      await this.prisma.bridgeTransaction.update({
        where: { id: bridgeTxId },
        data: {
          zkProof: JSON.stringify(zkProof)
        }
      });

      logger.info('ZK proof generated and stored', { bridgeTxId });
    } catch (error) {
      logger.error('Error generating ZK proof:', error);
      throw error;
    }
  }

  async initiateTargetTransaction(bridgeTxId: string): Promise<void> {
    try {
      const bridgeTx = await this.prisma.bridgeTransaction.findUnique({
        where: { id: bridgeTxId }
      });

      if (!bridgeTx) {
        throw new Error('Bridge transaction not found');
      }

      logger.info('Initiating target chain transaction', { bridgeTxId });

      // For demo purposes, we'll simulate the target transaction
      // In a real implementation, this would interact with Ethereum smart contracts
      const targetTxHash = `0x${generateNonce()}${Date.now().toString(16)}`;

      // Update with target transaction hash
      await this.prisma.bridgeTransaction.update({
        where: { id: bridgeTxId },
        data: {
          targetTxHash,
          status: TransactionStatus.COMPLETED
        }
      });

      logger.info('Target transaction initiated', { bridgeTxId, targetTxHash });
    } catch (error) {
      logger.error('Error initiating target transaction:', error);
      await this.updateBridgeStatus(bridgeTxId, TransactionStatus.FAILED, error.message);
    }
  }

  private validateBridgeData(data: BridgeInitiationData): void {
    if (!data.sourceTxHash || !data.sourceAmount || !data.sourceAddress || !data.targetAddress) {
      throw new Error('Missing required bridge data');
    }

    if (data.fromChain === data.toChain) {
      throw new Error('Source and target chains must be different');
    }

    if (parseFloat(data.sourceAmount) <= 0) {
      throw new Error('Source amount must be positive');
    }

    // Validate addresses based on chain
    if (data.fromChain === 'bitcoin') {
      if (!this.isValidBitcoinAddress(data.sourceAddress)) {
        throw new Error('Invalid Bitcoin source address');
      }
    } else {
      if (!this.isValidEthereumAddress(data.sourceAddress)) {
        throw new Error('Invalid Ethereum source address');
      }
    }

    if (data.toChain === 'bitcoin') {
      if (!this.isValidBitcoinAddress(data.targetAddress)) {
        throw new Error('Invalid Bitcoin target address');
      }
    } else {
      if (!this.isValidEthereumAddress(data.targetAddress)) {
        throw new Error('Invalid Ethereum target address');
      }
    }
  }

  private getBridgeDirection(fromChain: string, toChain: string): BridgeDirection {
    if (fromChain === 'bitcoin' && toChain === 'ethereum') {
      return BridgeDirection.BITCOIN_TO_ETHEREUM;
    } else if (fromChain === 'ethereum' && toChain === 'bitcoin') {
      return BridgeDirection.ETHEREUM_TO_BITCOIN;
    } else {
      throw new Error('Invalid bridge direction');
    }
  }

  private getChainName(direction: BridgeDirection, side: 'from' | 'to'): string {
    if (side === 'from') {
      return direction === BridgeDirection.BITCOIN_TO_ETHEREUM ? 'bitcoin' : 'ethereum';
    } else {
      return direction === BridgeDirection.BITCOIN_TO_ETHEREUM ? 'ethereum' : 'bitcoin';
    }
  }

  private isValidBitcoinAddress(address: string): boolean {
    // Basic Bitcoin address validation
    const p2pkhRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const p2shRegex = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
    const testnetRegex = /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const testnetBech32Regex = /^tb1[a-z0-9]{39,59}$/;
    
    return p2pkhRegex.test(address) || 
           p2shRegex.test(address) || 
           bech32Regex.test(address) ||
           testnetRegex.test(address) ||
           testnetBech32Regex.test(address);
  }

  private isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private async updateBridgeStatus(txId: string, status: TransactionStatus, error?: string): Promise<void> {
    await this.prisma.bridgeTransaction.update({
      where: { id: txId },
      data: {
        status,
        ...(error && { error })
      }
    });
  }

  private async updateBridgeConfirmations(txId: string, confirmations: number): Promise<void> {
    await this.prisma.bridgeTransaction.update({
      where: { id: txId },
      data: { confirmations }
    });
  }

  async getAllBridgeTransactions(userId?: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const transactions = await this.prisma.bridgeTransaction.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: { address: true }
          }
        }
      });

      return transactions;
    } catch (error) {
      logger.error('Error getting bridge transactions:', error);
      throw new Error(`Failed to get bridge transactions: ${error.message}`);
    }
  }

  /**
   * Store a bridge attempt with real Bitcoin transaction data
   */
  async storeBridgeAttempt(
    bitcoinTx: BitcoinTransaction,
    merkleProof: MerkleProof,
    ethereumAddress: string,
    userId?: string
  ): Promise<string> {
    try {
      const bridge = await this.prisma.bridgeTransaction.create({
        data: {
          direction: 'BITCOIN_TO_ETHEREUM',
          status: 'PENDING',
          sourceTxHash: bitcoinTx.txid,
          sourceAmount: bitcoinTx.amount.toString(),
          sourceAddress: bitcoinTx.inputs[0]?.address || '',
          targetAddress: ethereumAddress,
          merkleProof: JSON.stringify(merkleProof),
          blockHeight: bitcoinTx.blockHeight?.toString(),
          blockHash: bitcoinTx.blockHash,
          confirmations: bitcoinTx.confirmations,
          userId: userId || null,
          metadata: JSON.stringify({
            inputs: bitcoinTx.inputs,
            outputs: bitcoinTx.outputs,
            fee: bitcoinTx.fee,
            size: bitcoinTx.size,
            merkleRoot: merkleProof.merkleRoot,
            proofPath: merkleProof.proofPath,
            proofIndex: merkleProof.proofIndex
          })
        }
      });

      logger.info('Bridge attempt stored', { bridgeId: bridge.id, bitcoinTx: bitcoinTx.txid });
      return bridge.id;
    } catch (error) {
      logger.error('Error storing bridge attempt:', error);
      throw new Error('Failed to store bridge attempt');
    }
  }

  /**
   * Get bridge attempts for a user
   */
  async getBridgeAttempts(userId?: string, limit: number = 50): Promise<BridgeStatus[]> {
    try {
      const bridges = await this.prisma.bridgeTransaction.findMany({
        where: userId ? { userId } : {},
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: true
        }
      });

      return bridges.map(bridge => this.mapToBridgeStatus(bridge));
    } catch (error) {
      logger.error('Error getting bridge attempts:', error);
      throw new Error('Failed to get bridge attempts');
    }
  }
}

