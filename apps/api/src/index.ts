import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { sanitizationMiddleware } from './middleware/sanitization';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';

// Import routes
import bridgeRoutes from './routes/bridge';
import bitcoinRoutes from './routes/bitcoin';
import ethereumRoutes from './routes/ethereum';
import zkRoutes from './routes/zk';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://localhost:3000'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  },
  skip: (req) => req.url === '/health' // Skip logging for health checks
}));

// Rate limiting
app.use(limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Input sanitization middleware
app.use(sanitizationMiddleware);

// Import bridge transactions routes
import bridgeTransactionsRoutes from './routes/bridgeTransactions';

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/bridge', bridgeRoutes);
app.use('/api/bridge', bridgeTransactionsRoutes); // New comprehensive bridge transaction routes
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/proofs', bitcoinRoutes); // Merkle proofs endpoint
app.use('/api/ethereum', ethereumRoutes);
app.use('/api/zk', zkRoutes);

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'ZKBridge API Documentation',
    version: '1.0.0',
    endpoints: {
      health: {
        'GET /api/health': 'API health check',
        'GET /api/health/database': 'Database health check'
      },
      bridge: {
        'POST /api/bridge/initiate': 'Initiate bridge transaction',
        'GET /api/bridge/status/:txId': 'Get bridge status',
        'GET /api/bridge/transactions': 'Get bridge transactions',
        'POST /api/bridge/verify-source': 'Manually verify source transaction',
        'POST /api/bridge/cancel': 'Cancel bridge transaction',
        'GET /api/bridge/stats': 'Get bridge statistics',
        'GET /api/bridge/health': 'Bridge service health check'
      },
      bitcoin: {
        'POST /api/bitcoin/verify': 'Verify Bitcoin transaction',
        'GET /api/bitcoin/transaction/:txid': 'Get Bitcoin transaction details',
        'GET /api/bitcoin/balance/:address': 'Get Bitcoin balance',
        'GET /api/bitcoin/network-info': 'Get Bitcoin network info',
        'GET /api/bitcoin/block-count': 'Get current block count',
        'POST /api/bitcoin/validate-address': 'Validate Bitcoin address'
      },
      proofs: {
        'POST /api/proofs/generate': 'Generate Merkle proof',
        'POST /api/proofs/verify': 'Verify Merkle proof'
      },
      ethereum: {
        'GET /api/ethereum/transaction/:hash': 'Get Ethereum transaction details',
        'POST /api/ethereum/verify': 'Verify Ethereum transaction',
        'GET /api/ethereum/network-info': 'Get Ethereum network info',
        'GET /api/ethereum/balance/:address': 'Get Ethereum balance',
        'GET /api/ethereum/gas-price': 'Get gas price',
        'POST /api/ethereum/estimate-gas': 'Estimate gas for transaction'
      },
      zk: {
        'POST /api/zk/prove': 'Generate ZK proof',
        'POST /api/zk/verify': 'Verify ZK proof',
        'POST /api/zk/bridge-proof': 'Generate bridge-specific ZK proof',
        'POST /api/zk/verify-bridge-proof': 'Verify bridge-specific ZK proof',
        'POST /api/zk/demo/proof-of-knowledge': 'Demo proof of knowledge',
        'POST /api/zk/generate-witness': 'Generate witness for circuit',
        'GET /api/zk/circuit-info': 'Get circuit information',
        'GET /api/zk/health': 'ZK service health check'
      }
    },
    authentication: {
      type: 'Bearer Token or API Key',
      header: 'Authorization: Bearer <token> or X-API-Key: <key>'
    },
    rateLimiting: {
      default: '100 requests per 15 minutes',
      zk: '20 requests per 15 minutes',
      bridge: '50 requests per 15 minutes'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
