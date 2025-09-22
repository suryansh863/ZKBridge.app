import { Router } from 'express';
import { getPrismaClient } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '@zkbridge/shared';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'ZKBridge API is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  };

  res.json(response);
}));

router.get('/database', asyncHandler(async (req, res) => {
  const prisma = getPrismaClient();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    const response: ApiResponse = {
      success: true,
      message: 'Database connection is healthy',
      data: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Database connection failed',
      message: 'Unable to connect to database',
    };

    res.status(503).json(response);
  }
}));

export default router;

