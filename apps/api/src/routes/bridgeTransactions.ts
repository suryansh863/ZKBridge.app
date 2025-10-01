import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { bridgeTransactionService } from '../services/bridgeTransactionService';
import { logger } from '../utils/logger';

const router = Router();

// Validation middleware
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

// POST /api/bridge/transactions - Create new bridge transaction
router.post('/transactions', [
  body('direction').isIn(['BITCOIN_TO_ETHEREUM', 'ETHEREUM_TO_BITCOIN']),
  body('sourceTxHash').isString().notEmpty(),
  body('sourceAmount').isString().notEmpty(),
  body('sourceAddress').isString().notEmpty(),
  body('targetAddress').isString().notEmpty(),
  body('userId').optional().isString(),
], validateRequest, asyncHandler(async (req, res) => {
  const { direction, sourceTxHash, sourceAmount, sourceAddress, targetAddress, userId } = req.body;

  logger.info('Creating bridge transaction', { direction, sourceTxHash });

  const transaction = await bridgeTransactionService.createTransaction({
    direction,
    sourceTxHash,
    sourceAmount,
    sourceAddress,
    targetAddress,
    userId,
  });

  const response: ApiResponse = {
    success: true,
    data: transaction,
  };

  res.status(201).json(response);
}));

// GET /api/bridge/transactions/:id - Get transaction by ID
router.get('/transactions/:id', [
  param('id').isString().notEmpty(),
], validateRequest, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await bridgeTransactionService.getTransaction(id);

  const response: ApiResponse = {
    success: true,
    data: transaction,
  };

  res.json(response);
}));

// GET /api/bridge/transactions - Get all transactions with filters
router.get('/transactions', [
  query('status').optional().isString(),
  query('direction').optional().isString(),
  query('userId').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
], validateRequest, asyncHandler(async (req, res) => {
  const { status, direction, userId, limit, offset } = req.query;

  let result;
  if (userId) {
    result = await bridgeTransactionService.getUserTransactions(
      userId as string,
      parseInt(limit as string) || 50,
      parseInt(offset as string) || 0
    );
  } else {
    result = await bridgeTransactionService.getAllTransactions({
      status: status as string,
      direction: direction as string,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    });
  }

  const response: ApiResponse = {
    success: true,
    data: result.transactions,
    meta: {
      total: result.total,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    },
  };

  res.json(response);
}));

// POST /api/bridge/transactions/:id/process - Process bridge transaction
router.post('/transactions/:id/process', [
  param('id').isString().notEmpty(),
], validateRequest, asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Processing bridge transaction', { transactionId: id });

  const transaction = await bridgeTransactionService.getTransaction(id);

  if (transaction.direction === 'BITCOIN_TO_ETHEREUM') {
    const result = await bridgeTransactionService.processBitcoinToEthereum(id);
    
    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  } else {
    throw new Error('Ethereum to Bitcoin bridging not yet implemented');
  }
}));

// GET /api/bridge/transactions/:id/events - Get transaction events
router.get('/transactions/:id/events', [
  param('id').isString().notEmpty(),
], validateRequest, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const events = await bridgeTransactionService.getTransactionEvents(id);

  const response: ApiResponse = {
    success: true,
    data: events,
  };

  res.json(response);
}));

// GET /api/bridge/transactions/hash/:sourceTxHash - Get transaction by source hash
router.get('/transactions/hash/:sourceTxHash', [
  param('sourceTxHash').isString().notEmpty(),
], validateRequest, asyncHandler(async (req, res) => {
  const { sourceTxHash } = req.params;

  const transaction = await bridgeTransactionService.getTransactionBySourceHash(sourceTxHash);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found',
    });
  }

  const response: ApiResponse = {
    success: true,
    data: transaction,
  };

  res.json(response);
}));

// GET /api/bridge/statistics - Get bridge statistics
router.get('/statistics', asyncHandler(async (req, res) => {
  const stats = await bridgeTransactionService.getStatistics();

  const response: ApiResponse = {
    success: true,
    data: stats,
  };

  res.json(response);
}));

export default router;
