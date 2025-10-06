import dotenv from 'dotenv';

dotenv.config();

export const securityConfig = {
  // API Keys
  apiKeys: {
    admin: process.env.ADMIN_API_KEYS?.split(',') || [],
    readonly: process.env.READONLY_API_KEYS?.split(',') || [],
    full: process.env.API_KEYS?.split(',') || [],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    zkMaxRequests: parseInt(process.env.ZK_RATE_LIMIT_MAX || '20'),
    bridgeMaxRequests: parseInt(process.env.BRIDGE_RATE_LIMIT_MAX || '50'),
  },

  // Security Headers
  securityHeaders: {
    enabled: process.env.SECURITY_HEADERS_ENABLED === 'true',
    cspEnabled: true,
    hstsEnabled: process.env.NODE_ENV === 'production',
  },

  // CORS Configuration
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-API-Key', 
      'X-Requested-With',
      'X-Forwarded-For',
      'X-Real-IP'
    ],
  },

  // Request Limits
  request: {
    maxSize: parseInt(process.env.MAX_REQUEST_SIZE || '10485760'), // 10MB
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'), // 30 seconds
  },

  // Security Features
  features: {
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
    enableSecurityAudit: process.env.ENABLE_SECURITY_AUDIT === 'true',
    blockSuspiciousIPs: process.env.BLOCK_SUSPICIOUS_IPS === 'true',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'zkbridge',
    audience: process.env.JWT_AUDIENCE || 'zkbridge-api',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    algorithm: 'aes-256-gcm',
  },

  // Security Audit
  audit: {
    logSuspiciousActivity: true,
    riskScoreThreshold: 50,
    ipBlockingThreshold: 3,
    rateLimitViolationThreshold: 2,
  },

  // Environment-specific settings
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
};

// Validation function
export const validateSecurityConfig = () => {
  const errors: string[] = [];

  if (!securityConfig.jwt.secret || securityConfig.jwt.secret === 'your_jwt_secret_here') {
    errors.push('JWT_SECRET is required');
  }

  if (!securityConfig.encryption.key || securityConfig.encryption.key === 'your_encryption_key_here') {
    errors.push('ENCRYPTION_KEY is required');
  }

  if (securityConfig.apiKeys.full.length === 0) {
    errors.push('At least one API key must be configured');
  }

  if (securityConfig.rateLimit.maxRequests <= 0) {
    errors.push('Rate limit max requests must be greater than 0');
  }

  if (securityConfig.request.maxSize <= 0) {
    errors.push('Request max size must be greater than 0');
  }

  if (errors.length > 0) {
    console.warn('Security configuration warnings:', errors.join(', '));
    return false;
  }

  return true;
};

export default securityConfig;
