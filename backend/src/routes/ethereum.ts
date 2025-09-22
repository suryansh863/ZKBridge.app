import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { ApiResponse, EthereumTransaction } from '../types';
import { EthereumService } from '../services/ethereumService';

const router = Router();
const ethereumService = new EthereumService();

// Get Ethereum transaction details
router.get('/transaction/:hash', [
  param('hash').isString().notEmpty().withMessage('Transaction hash is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { hash } = req.params;
  const transaction = await ethereumService.getTransaction(hash);

  const response: ApiResponse<EthereumTransaction> = {
    success: true,
    data: transaction
  };

  res.json(response);
}));

// Verify Ethereum transaction
router.post('/verify', [
  body('hash').isString().notEmpty().withMessage('Transaction hash is required'),
  body('address').isString().notEmpty().withMessage('Address is required'),
  body('amount').isString().withMessage('Amount must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { hash, address, amount } = req.body;
  const isValid = await ethereumService.verifyTransaction(hash, address, amount);

  const response: ApiResponse<{ isValid: boolean }> = {
    success: true,
    data: { isValid }
  };

  res.json(response);
}));

// Get Ethereum network info
router.get('/network-info', asyncHandler(async (req, res) => {
  const networkInfo = await ethereumService.getNetworkInfo();

  const response: ApiResponse = {
    success: true,
    data: networkInfo
  };

  res.json(response);
}));

// Get Ethereum balance for address
router.get('/balance/:address', [
  param('address').isString().notEmpty().withMessage('Address is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { address } = req.params;
  const balance = await ethereumService.getBalance(address);

  const response: ApiResponse<{ balance: string }> = {
    success: true,
    data: { balance }
  };

  res.json(response);
}));

// Get gas price
router.get('/gas-price', asyncHandler(async (req, res) => {
  const gasPrice = await ethereumService.getGasPrice();

  const response: ApiResponse<{ gasPrice: string }> = {
    success: true,
    data: { gasPrice }
  };

  res.json(response);
}));

// Estimate gas for transaction
router.post('/estimate-gas', [
  body('to').isString().notEmpty().withMessage('To address is required'),
  body('value').isString().withMessage('Value must be a string'),
  body('data').optional().isString().withMessage('Data must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400);
  }

  const { to, value, data } = req.body;
  const gasEstimate = await ethereumService.estimateGas({ to, value, data });

  const response: ApiResponse<{ gasEstimate: string }> = {
    success: true,
    data: { gasEstimate }
  };

  res.json(response);
}));

export default router;

