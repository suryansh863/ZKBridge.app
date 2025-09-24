import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    prisma.$on('query', (e) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Query: ' + e.query);
        logger.debug('Params: ' + e.params);
        logger.debug('Duration: ' + e.duration + 'ms');
      }
    });

    prisma.$on('error', (e) => {
      logger.error('Database error:', e);
    });

    prisma.$on('info', (e) => {
      logger.info('Database info:', e.message);
    });

    prisma.$on('warn', (e) => {
      logger.warn('Database warning:', e.message);
    });
  }

  return prisma;
}

export async function connectDatabase(): Promise<void> {
  const client = getPrismaClient();
  
  try {
    await client.$connect();
    logger.info('Successfully connected to database');
  } catch (error) {
    logger.warn('Failed to connect to database, running without database:', error);
    // Don't throw error, allow server to start without database
  }
}

export async function disconnectDatabase(): Promise<void> {
  const client = getPrismaClient();
  
  try {
    await client.$disconnect();
    logger.info('Successfully disconnected from database');
  } catch (error) {
    logger.error('Failed to disconnect from database:', error);
    throw error;
  }
}

