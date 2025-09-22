import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { ApiResponse, BitcoinTransaction, MerkleProof } from '../types';
import { BitcoinService } from '../services/bitcoinService';
import { rateLimit } from 'express-rate-limit';
import { logger } from '../utils/logger';

const router = Router();
const bitcoinService = new BitcoinService();

// Rate limiting for Bitcoin API
const bitcoinRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many Bitcoin API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all Bitcoin routes
router.use(bitcoinRateLimit);

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

// POST /api/bitcoin/verify - Verify Bitcoin transaction
router.post('/verify', [
  body('txid').isString().notEmpty().withMessage('Transaction ID is required'),
  body('address').isString().notEmpty().withMessage('Address is required'),
  body('amount').isNumeric().withMessage('Amount must be numeric'),
], validateRequest, asyncHandler(async (req, res) => {
  const { txid, address, amount } = req.body;

  logger.info('Bitcoin transaction verification requested', { txid, address, amount });

  try {
    const verificationResult = await bitcoinService.verifyTransaction(txid, address, amount);

    const response: ApiResponse = {
      success: true,
      data: verificationResult,
      message: verificationResult.isValid ? 'Transaction verified successfully' : 'Transaction verification failed'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bitcoin verification error:', error);
    throw new CustomError('Failed to verify Bitcoin transaction', 500);
  }
}));

// POST /api/proofs/generate - Generate Merkle proof
router.post('/proofs/generate', [
  body('txid').isString().notEmpty().withMessage('Transaction ID is required'),
  body('blockHash').optional().isString().withMessage('Block hash must be a string'),
], validateRequest, asyncHandler(async (req, res) => {
  const { txid, blockHash } = req.body;

  logger.info('Merkle proof generation requested', { txid, blockHash });

  try {
    const merkleProof = await bitcoinService.generateMerkleProof(txid, blockHash);

    const response: ApiResponse<MerkleProof> = {
      success: true,
      data: merkleProof,
      message: 'Merkle proof generated successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Merkle proof generation error:', error);
    throw new CustomError('Failed to generate Merkle proof', 500);
  }
}));

// POST /api/proofs/verify - Verify Merkle proof
router.post('/proofs/verify', [
  body('leaf').isString().notEmpty().withMessage('Leaf is required'),
  body('path').isArray().withMessage('Path must be an array'),
  body('indices').isArray().withMessage('Indices must be an array'),
  body('root').isString().notEmpty().withMessage('Root is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { leaf, path, indices, root } = req.body;

  logger.info('Merkle proof verification requested', { leaf, root });

  try {
    const merkleProof: MerkleProof = { leaf, path, indices, root };
    const isValid = await bitcoinService.verifyMerkleProof(merkleProof);

    const response: ApiResponse<{ isValid: boolean }> = {
      success: true,
      data: { isValid },
      message: isValid ? 'Merkle proof verified successfully' : 'Merkle proof verification failed'
    };

    res.json(response);
  } catch (error) {
    logger.error('Merkle proof verification error:', error);
    throw new CustomError('Failed to verify Merkle proof', 500);
  }
}));

// GET /api/bitcoin/transaction/:txid - Get Bitcoin transaction details
router.get('/transaction/:txid', [
  param('txid').isString().notEmpty().withMessage('Transaction ID is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { txid } = req.params;

  logger.info('Bitcoin transaction details requested', { txid });

  try {
    const transaction = await bitcoinService.getTransaction(txid);

    const response: ApiResponse<BitcoinTransaction> = {
      success: true,
      data: transaction
    };

    res.json(response);
  } catch (error) {
    logger.error('Bitcoin transaction fetch error:', error);
    throw new CustomError('Failed to get Bitcoin transaction', 500);
  }
}));

// GET /api/bitcoin/balance/:address - Get Bitcoin balance
router.get('/balance/:address', [
  param('address').isString().notEmpty().withMessage('Address is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { address } = req.params;

  logger.info('Bitcoin balance requested', { address });

  try {
    const balance = await bitcoinService.getBalance(address);

    const response: ApiResponse<{ balance: number }> = {
      success: true,
      data: { balance }
    };

    res.json(response);
  } catch (error) {
    logger.error('Bitcoin balance fetch error:', error);
    throw new CustomError('Failed to get Bitcoin balance', 500);
  }
}));

// GET /api/bitcoin/network-info - Get Bitcoin network info
router.get('/network-info', asyncHandler(async (req, res) => {
  logger.info('Bitcoin network info requested');

  try {
    const networkInfo = await bitcoinService.getNetworkInfo();

    const response: ApiResponse = {
      success: true,
      data: networkInfo
    };

    res.json(response);
  } catch (error) {
    logger.error('Bitcoin network info error:', error);
    throw new CustomError('Failed to get Bitcoin network info', 500);
  }
}));

// GET /api/bitcoin/block-count - Get current block count
router.get('/block-count', asyncHandler(async (req, res) => {
  logger.info('Bitcoin block count requested');

  try {
    const blockCount = await bitcoinService.getBlockCount();

    const response: ApiResponse<{ blockCount: number }> = {
      success: true,
      data: { blockCount }
    };

    res.json(response);
  } catch (error) {
    logger.error('Bitcoin block count error:', error);
    throw new CustomError('Failed to get Bitcoin block count', 500);
  }
}));

// POST /api/bitcoin/validate-address - Validate Bitcoin address
router.post('/validate-address', [
  body('address').isString().notEmpty().withMessage('Address is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { address } = req.body;

  logger.info('Bitcoin address validation requested', { address });

  try {
    // Basic validation - in a real implementation, you might want more sophisticated validation
    const isValid = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^3[a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$|^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$|^tb1[a-z0-9]{39,59}$/.test(address);

    const response: ApiResponse<{ isValid: boolean; type?: string }> = {
      success: true,
      data: { 
        isValid,
        type: isValid ? this.getAddressType(address) : undefined
      },
      message: isValid ? 'Address is valid' : 'Address is invalid'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bitcoin address validation error:', error);
    throw new CustomError('Failed to validate Bitcoin address', 500);
  }
}));

// Helper function to determine address type
function getAddressType(address: string): string {
  if (address.startsWith('1')) return 'P2PKH (Legacy)';
  if (address.startsWith('3')) return 'P2SH (Script Hash)';
  if (address.startsWith('bc1')) return 'Bech32 (Native SegWit)';
  if (address.startsWith('m') || address.startsWith('n')) return 'P2PKH (Testnet)';
  if (address.startsWith('2')) return 'P2SH (Testnet)';
  if (address.startsWith('tb1')) return 'Bech32 (Testnet)';
  return 'Unknown';
}

export default router;