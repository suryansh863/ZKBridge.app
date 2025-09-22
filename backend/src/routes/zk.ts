import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { ApiResponse, ZKProof } from '@zkbridge/shared';
import { ZKProofService } from '../services/zkProofService';
import { rateLimit } from 'express-rate-limit';
import { logger } from '../utils/logger';

const router = Router();
const zkProofService = new ZKProofService();

// Rate limiting for ZK API (more restrictive due to computational cost)
const zkRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many ZK proof requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all ZK routes
router.use(zkRateLimit);

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

// POST /api/zk/prove - Generate ZK proof
router.post('/prove', [
  body('secret').isString().notEmpty().withMessage('Secret is required'),
  body('publicInput').isString().notEmpty().withMessage('Public input is required'),
  body('additionalData').optional().isObject().withMessage('Additional data must be an object'),
], validateRequest, asyncHandler(async (req, res) => {
  const { secret, publicInput, additionalData } = req.body;

  logger.info('ZK proof generation requested', { 
    secretLength: secret.length, 
    publicInputLength: publicInput.length,
    hasAdditionalData: !!additionalData 
  });

  try {
    const proof = await zkProofService.generateProof(secret, publicInput, additionalData);

    const response: ApiResponse<ZKProof> = {
      success: true,
      data: proof,
      message: 'ZK proof generated successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('ZK proof generation error:', error);
    throw new CustomError('Failed to generate ZK proof', 500);
  }
}));

// POST /api/zk/verify - Verify ZK proof
router.post('/verify', [
  body('proof').isObject().withMessage('Proof must be an object'),
  body('publicSignals').isArray().withMessage('Public signals must be an array'),
], validateRequest, asyncHandler(async (req, res) => {
  const { proof, publicSignals } = req.body;

  logger.info('ZK proof verification requested', { 
    hasProof: !!proof,
    publicSignalsCount: publicSignals?.length || 0 
  });

  try {
    const isValid = await zkProofService.verifyProof(proof, publicSignals);

    const response: ApiResponse<{ isValid: boolean }> = {
      success: true,
      data: { isValid },
      message: isValid ? 'ZK proof verified successfully' : 'ZK proof verification failed'
    };

    res.json(response);
  } catch (error) {
    logger.error('ZK proof verification error:', error);
    throw new CustomError('Failed to verify ZK proof', 500);
  }
}));

// POST /api/zk/bridge-proof - Generate bridge-specific ZK proof
router.post('/bridge-proof', [
  body('bitcoinTxData').isObject().withMessage('Bitcoin transaction data is required'),
  body('bitcoinTxData.txid').isString().notEmpty().withMessage('Bitcoin transaction ID is required'),
  body('bitcoinTxData.amount').isNumeric().withMessage('Bitcoin amount must be numeric'),
  body('bitcoinTxData.fromAddress').isString().notEmpty().withMessage('Bitcoin from address is required'),
  body('bitcoinTxData.confirmations').isNumeric().withMessage('Confirmations must be numeric'),
  body('ethereumData').isObject().withMessage('Ethereum data is required'),
  body('ethereumData.address').isString().notEmpty().withMessage('Ethereum address is required'),
  body('ethereumData.amount').isString().notEmpty().withMessage('Ethereum amount is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { bitcoinTxData, ethereumData } = req.body;

  logger.info('Bridge ZK proof generation requested', { 
    bitcoinTxId: bitcoinTxData.txid,
    ethereumAddress: ethereumData.address 
  });

  try {
    const proof = await zkProofService.generateBridgeProof(bitcoinTxData, ethereumData);

    const response: ApiResponse<ZKProof> = {
      success: true,
      data: proof,
      message: 'Bridge ZK proof generated successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge ZK proof generation error:', error);
    throw new CustomError('Failed to generate bridge ZK proof', 500);
  }
}));

// POST /api/zk/verify-bridge-proof - Verify bridge-specific ZK proof
router.post('/verify-bridge-proof', [
  body('proof').isObject().withMessage('Proof must be an object'),
  body('expectedData').isObject().withMessage('Expected data is required'),
  body('expectedData.bitcoinTxHash').isString().notEmpty().withMessage('Bitcoin transaction hash is required'),
  body('expectedData.bitcoinAmount').isNumeric().withMessage('Bitcoin amount must be numeric'),
  body('expectedData.ethereumAddress').isString().notEmpty().withMessage('Ethereum address is required'),
  body('expectedData.ethereumAmount').isString().notEmpty().withMessage('Ethereum amount is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { proof, expectedData } = req.body;

  logger.info('Bridge ZK proof verification requested', { 
    bitcoinTxHash: expectedData.bitcoinTxHash,
    ethereumAddress: expectedData.ethereumAddress 
  });

  try {
    const zkProof: ZKProof = {
      proof,
      publicSignals: [] // This would be extracted from the proof in a real implementation
    };

    const isValid = await zkProofService.verifyBridgeProof(zkProof, expectedData);

    const response: ApiResponse<{ isValid: boolean }> = {
      success: true,
      data: { isValid },
      message: isValid ? 'Bridge ZK proof verified successfully' : 'Bridge ZK proof verification failed'
    };

    res.json(response);
  } catch (error) {
    logger.error('Bridge ZK proof verification error:', error);
    throw new CustomError('Failed to verify bridge ZK proof', 500);
  }
}));

// POST /api/zk/demo/proof-of-knowledge - Demo proof of knowledge
router.post('/demo/proof-of-knowledge', [
  body('secret').isString().notEmpty().withMessage('Secret is required'),
], validateRequest, asyncHandler(async (req, res) => {
  const { secret } = req.body;

  logger.info('Demo proof of knowledge requested', { secretLength: secret.length });

  try {
    const result = await zkProofService.demoProofOfKnowledge(secret);

    const response: ApiResponse = {
      success: true,
      data: {
        proof: result.proof,
        isValid: result.isValid,
        message: result.message
      },
      message: 'Demo proof of knowledge completed'
    };

    res.json(response);
  } catch (error) {
    logger.error('Demo proof of knowledge error:', error);
    throw new CustomError('Failed to demonstrate proof of knowledge', 500);
  }
}));

// POST /api/zk/generate-witness - Generate witness for circuit
router.post('/generate-witness', [
  body('inputs').isObject().withMessage('Inputs must be an object'),
  body('inputs.secret').optional().isString().withMessage('Secret must be a string'),
  body('inputs.publicInput').optional().isString().withMessage('Public input must be a string'),
  body('inputs.nonce').optional().isString().withMessage('Nonce must be a string'),
  body('inputs.timestamp').optional().isNumeric().withMessage('Timestamp must be numeric'),
], validateRequest, asyncHandler(async (req, res) => {
  const { inputs } = req.body;

  logger.info('Witness generation requested', { 
    hasSecret: !!inputs.secret,
    hasPublicInput: !!inputs.publicInput 
  });

  try {
    const witness = await zkProofService.generateWitness(inputs);

    const response: ApiResponse<{ witness: any }> = {
      success: true,
      data: { witness },
      message: 'Witness generated successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Witness generation error:', error);
    throw new CustomError('Failed to generate witness', 500);
  }
}));

// GET /api/zk/circuit-info - Get circuit information
router.get('/circuit-info', asyncHandler(async (req, res) => {
  logger.info('Circuit info requested');

  try {
    const circuitInfo = await zkProofService.getCircuitInfo();

    const response: ApiResponse = {
      success: true,
      data: circuitInfo,
      message: 'Circuit information retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Circuit info error:', error);
    throw new CustomError('Failed to get circuit information', 500);
  }
}));

// GET /api/zk/health - Check ZK service health
router.get('/health', asyncHandler(async (req, res) => {
  logger.info('ZK service health check requested');

  try {
    const circuitInfo = await zkProofService.getCircuitInfo();
    
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        circuitAvailable: circuitInfo.isAvailable,
        timestamp: new Date().toISOString()
      },
      message: 'ZK service is healthy'
    };

    res.json(response);
  } catch (error) {
    logger.error('ZK health check error:', error);
    throw new CustomError('ZK service health check failed', 500);
  }
}));

export default router;