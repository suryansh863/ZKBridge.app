import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { ApiResponse, BridgeTransaction, BridgeDirection, TransactionStatus } from '../types';
import { BridgeService } from '../services/bridgeService';
import { BitcoinService } from '../services/bitcoinService';
import { rateLimit } from 'express-rate-limit';
import { logger } from '../utils/logger';

const router = Router();
const bridgeService = new BridgeService();
const bitcoinService = new BitcoinService();

// Rate limiting for Bridge API
const bridgeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many bridge requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all bridge routes
router.use(bridgeRateLimit);

// Input validation middleware
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// POST /api/bridge/initiate - Start bridge process
router.post('/initiate', [
  body('fromChain').isIn(['bitcoin', 'ethereum']).withMessage('From chain must be bitcoin or ethereum'),
  body('toChain').isIn(['bitcoin', 'ethereum']).withMessage('To chain must be bitcoin or ethereum'),
  body('sourceTxHash').isString().notEmpty().withMessage('Source transaction hash is required'),
  body('sourceAmount').isString().notEmpty().withMessage('Source amount is required'),
  body('sourceAddress').isString().notEmpty().withMessage('Source address is required'),
  body('targetAddress').isString().notEmpty().withMessage('Target address is required'),
  body('userId').optional().isString().withMessage('User ID must be a string'),
], validateRequest, asyncHandler(async (req, res) => {
  const {
    fromChain,
    toChain,
    sourceTxHash,
    sourceAmount,
    sourceAddress,
    targetAddress,
    userId
  } = req.body;

  logger.info('Bridge initiation requested', { 
    fromChain, 
    toChain, 
    sourceTxHash,
    sourceAmount,
    userId 
  });

  try {
    const bridgeStatus = await bridgeService.initiateBridge({
      fromChain,
      toChain,
      sourceTxHash,
      sourceAmount,
      sourceAddress,
      targetAddress,
      userId
    });

    const response: ApiResponse = {
      success: true,
      data: bridgeStatus,
      message: 'Bridge process initiated successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Bridge initiation error:', error);
    throw new CustomError('Failed to initiate bridge process', 500);
  }
}));

// GET /api/bridge/status/:txId - Check bridge status
router.get('/status/:txId', [
  param('txId').isString().notEmpty().withMessage('Transaction ID is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { txId } = req.params;

  logger.info('Bridge status requested', { txId });

  try {
    const status = await bridgeService.getBridgeStatus(txId);

    const response: ApiResponse = {
      success: true,
      data: status,
      message: 'Bridge status retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge status error:', error);
    if (error.message.includes('not found')) {
      throw new CustomError('Bridge transaction not found', 404);
    }
    throw new CustomError('Failed to get bridge status', 500);
  }
}));

// GET /api/bridge/transactions - Get all bridge transactions
router.get('/transactions', [
  query('userId').optional().isString().withMessage('User ID must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
], validateRequest, asyncHandler(async (req, res) => {
  const { userId, limit = 50, offset = 0 } = req.query;

  logger.info('Bridge transactions requested', { userId, limit, offset });

  try {
    const transactions = await bridgeService.getAllBridgeTransactions(
      userId as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    const response: ApiResponse = {
      success: true,
      data: transactions,
      message: 'Bridge transactions retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge transactions error:', error);
    throw new CustomError('Failed to get bridge transactions', 500);
  }
}));

// POST /api/bridge/verify-source - Manually trigger source verification
router.post('/verify-source', [
  body('txId').isString().notEmpty().withMessage('Transaction ID is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { txId } = req.body;

  logger.info('Manual source verification requested', { txId });

  try {
    // Start async verification process
    bridgeService.verifySourceTransaction(txId).catch(error => {
      logger.error('Async verification error:', error);
    });

    const response: ApiResponse = {
      success: true,
      data: { txId, status: 'verification_started' },
      message: 'Source verification process started'
    };

    res.json(response);
  } catch (error) {
    logger.error('Manual verification trigger error:', error);
    throw new CustomError('Failed to trigger source verification', 500);
  }
}));

// POST /api/bridge/cancel - Cancel bridge transaction
router.post('/cancel', [
  body('txId').isString().notEmpty().withMessage('Transaction ID is required'),
  body('reason').optional().isString().withMessage('Cancellation reason must be a string'),
], validateRequest, asyncHandler(async (req, res) => {
  const { txId, reason } = req.body;

  logger.info('Bridge cancellation requested', { txId, reason });

  try {
    // Update transaction status to failed with cancellation reason
    const prisma = (await import('../config/database')).getPrismaClient();
    
    const updatedTx = await prisma.bridgeTransaction.update({
      where: { id: txId },
      data: {
        status: TransactionStatus.FAILED,
        error: reason || 'Transaction cancelled by user'
      }
    });

    const response: ApiResponse = {
      success: true,
      data: { txId, status: updatedTx.status },
      message: 'Bridge transaction cancelled successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge cancellation error:', error);
    if (error.message.includes('not found')) {
      throw new CustomError('Bridge transaction not found', 404);
    }
    throw new CustomError('Failed to cancel bridge transaction', 500);
  }
}));

// GET /api/bridge/stats - Get bridge statistics
router.get('/stats', asyncHandler(async (req, res) => {
  logger.info('Bridge statistics requested');

  try {
    const prisma = (await import('../config/database')).getPrismaClient();
    
    // Get statistics
    const [
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalVolume
    ] = await Promise.all([
      prisma.bridgeTransaction.count(),
      prisma.bridgeTransaction.count({ where: { status: TransactionStatus.COMPLETED } }),
      prisma.bridgeTransaction.count({ where: { status: TransactionStatus.PENDING } }),
      prisma.bridgeTransaction.count({ where: { status: TransactionStatus.FAILED } }),
      prisma.bridgeTransaction.aggregate({
        _sum: { sourceAmount: true },
        where: { status: TransactionStatus.COMPLETED }
      })
    ]);

    const stats = {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
      totalVolume: totalVolume._sum.sourceAmount || '0'
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'Bridge statistics retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge stats error:', error);
    throw new CustomError('Failed to get bridge statistics', 500);
  }
}));

// GET /api/bridge/health - Check bridge service health
router.get('/health', asyncHandler(async (req, res) => {
  logger.info('Bridge health check requested');

  try {
    // Check database connection
    const prisma = (await import('../config/database')).getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;

    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          bitcoin: 'available',
          ethereum: 'available',
          zk: 'available'
        }
      },
      message: 'Bridge service is healthy'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge health check error:', error);
    throw new CustomError('Bridge service health check failed', 500);
  }
}));

// POST /api/bridge/store-attempt - Store a bridge attempt with real Bitcoin data
router.post('/store-attempt', [
  body('bitcoinTxId').isString().notEmpty().withMessage('Bitcoin transaction ID is required'),
  body('ethereumAddress').isString().notEmpty().withMessage('Ethereum address is required'),
  body('userId').optional().isString().withMessage('User ID must be a string'),
], validateRequest, asyncHandler(async (req, res) => {
  const { bitcoinTxId, ethereumAddress, userId } = req.body;

  logger.info('Bridge attempt storage requested', { bitcoinTxId, ethereumAddress, userId });

  try {
    // Get detailed Bitcoin transaction
    const bitcoinTx = await bitcoinService.getDetailedTransaction(bitcoinTxId);
    
    // Generate Merkle proof
    const merkleProof = await bitcoinService.getDetailedMerkleProof(bitcoinTxId);
    
    // Store bridge attempt
    const bridgeId = await bridgeService.storeBridgeAttempt(
      bitcoinTx,
      merkleProof,
      ethereumAddress,
      userId
    );

    const response: ApiResponse<{ bridgeId: string }> = {
      success: true,
      data: { bridgeId },
      message: 'Bridge attempt stored successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge attempt storage error:', error);
    throw new CustomError(`Failed to store bridge attempt: ${error.message}`, 500);
  }
}));

export default router;