import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { authenticateApiKey } from './auth';

// IP-based rate limiting storage
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const suspiciousIPs = new Set<string>();

// Suspicious activity patterns
const SUSPICIOUS_PATTERNS = [
  /\.\.\//g,           // Path traversal
  /<script/gi,         // XSS attempts
  /union.*select/gi,   // SQL injection
  /\$where/gi,         // NoSQL injection
  /javascript:/gi,     // JavaScript protocol
  /on\w+\s*=/gi,      // Event handlers
];

// Admin endpoints that require special access
const ADMIN_ENDPOINTS = [
  '/api/admin',
  '/api/users',
  '/api/system',
  '/api/logs',
  '/api/security'
];

// Read-only endpoints
const READONLY_ENDPOINTS = [
  '/api/health',
  '/api/bridge/status',
  '/api/bridge/transactions',
  '/api/bitcoin/balance',
  '/api/bitcoin/transaction',
  '/api/ethereum/balance',
  '/api/ethereum/transaction',
  '/api/zk/circuit-info'
];

export interface SecurityRequest extends Request {
  security?: {
    isSuspicious: boolean;
    riskScore: number;
    ip: string;
    userAgent: string;
    apiKey?: string;
    accessLevel: 'public' | 'readonly' | 'full' | 'admin';
  };
}

// Enhanced IP-based rate limiting
export const advancedRateLimit = (windowMs: number, maxRequests: number, endpoint?: string) => {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}_${endpoint || 'global'}`;

    // Check if IP is blocked
    if (suspiciousIPs.has(ip)) {
      logger.warn('Blocked suspicious IP attempted access', { ip, endpoint: req.path });
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'IP address has been flagged for suspicious activity'
      });
    }

    const requestData = ipRequestCounts.get(key);
    
    if (!requestData || now > requestData.resetTime) {
      ipRequestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (requestData.count >= maxRequests) {
      logger.warn('Rate limit exceeded', { 
        ip, 
        endpoint: req.path, 
        count: requestData.count,
        limit: maxRequests 
      });
      
      // Flag as suspicious if repeatedly exceeding limits
      if (requestData.count >= maxRequests * 2) {
        suspiciousIPs.add(ip);
        logger.error('IP flagged as suspicious due to excessive rate limit violations', { ip });
      }

      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
      });
    }

    requestData.count++;
    next();
  };
};

// Security audit middleware
export const securityAudit = (req: SecurityRequest, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  let riskScore = 0;
  let isSuspicious = false;

  // Check for suspicious patterns in request
  const requestBody = JSON.stringify(req.body || {});
  const requestUrl = req.url;
  const requestHeaders = JSON.stringify(req.headers);

  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(requestBody) || pattern.test(requestUrl) || pattern.test(requestHeaders)) {
      riskScore += 20;
      isSuspicious = true;
    }
  });

  // Check for suspicious User-Agent
  const suspiciousUserAgents = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /sqlmap/i, /nmap/i, /nikto/i, /burp/i,
    /python/i, /curl/i, /wget/i, /postman/i
  ];

  suspiciousUserAgents.forEach(pattern => {
    if (pattern.test(userAgent)) {
      riskScore += 10;
    }
  });

  // Check for unusual request patterns
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    riskScore += 15;
  }

  // Check for missing or malformed headers
  if (!req.headers['content-type'] && (req.method === 'POST' || req.method === 'PUT')) {
    riskScore += 5;
  }

  // Set security context
  req.security = {
    isSuspicious,
    riskScore,
    ip,
    userAgent,
    accessLevel: 'public'
  };

  // Log suspicious activity
  if (isSuspicious || riskScore > 30) {
    logger.warn('Suspicious request detected', {
      ip,
      userAgent,
      riskScore,
      method: req.method,
      url: req.url,
      body: req.body
    });

    // Block high-risk requests
    if (riskScore > 50) {
      suspiciousIPs.add(ip);
      return res.status(403).json({
        success: false,
        error: 'Request blocked',
        message: 'Suspicious activity detected'
      });
    }
  }

  next();
};

// API key validation with access levels
export const validateApiKeyAccess = (requiredLevel: 'readonly' | 'full' | 'admin') => {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      req.security = { ...req.security, accessLevel: 'public' };
      return next();
    }

    const adminKeys = process.env.ADMIN_API_KEYS?.split(',') || [];
    const readonlyKeys = process.env.READONLY_API_KEYS?.split(',') || [];
    const fullKeys = process.env.API_KEYS?.split(',') || [];

    let accessLevel: 'public' | 'readonly' | 'full' | 'admin' = 'public';

    if (adminKeys.includes(apiKey)) {
      accessLevel = 'admin';
    } else if (fullKeys.includes(apiKey)) {
      accessLevel = 'full';
    } else if (readonlyKeys.includes(apiKey)) {
      accessLevel = 'readonly';
    } else {
      return res.status(403).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }

    // Check access level requirements
    const accessLevels = { public: 0, readonly: 1, full: 2, admin: 3 };
    const requiredLevelValue = accessLevels[requiredLevel];
    const userLevelValue = accessLevels[accessLevel];

    if (userLevelValue < requiredLevelValue) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Access level '${requiredLevel}' required`
      });
    }

    req.security = { ...req.security, apiKey, accessLevel };
    next();
  };
};

// Endpoint-specific protection
export const protectEndpoint = (endpointType: 'admin' | 'readonly' | 'full') => {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const path = req.path;
    
    // Check if endpoint requires specific access
    if (endpointType === 'admin' && !ADMIN_ENDPOINTS.some(ep => path.startsWith(ep))) {
      return next(); // Not an admin endpoint
    }
    
    if (endpointType === 'readonly' && !READONLY_ENDPOINTS.some(ep => path.startsWith(ep))) {
      return next(); // Not a readonly endpoint
    }

    // Apply appropriate access level
    return validateApiKeyAccess(endpointType)(req, res, next);
  };
};

// Request size limiting
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      logger.warn('Request size limit exceeded', {
        ip: req.ip,
        contentLength,
        maxSize,
        url: req.url
      });
      
      return res.status(413).json({
        success: false,
        error: 'Request too large',
        message: `Request size exceeds limit of ${maxSize} bytes`
      });
    }
    
    next();
  };
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add custom security header
  res.setHeader('X-ZKBridge-Security', 'enabled');
  
  next();
};

// Request timeout middleware
export const requestTimeout = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(timeout, () => {
      logger.warn('Request timeout', {
        ip: req.ip,
        url: req.url,
        timeout
      });
      
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          message: 'Request took too long to process'
        });
      }
    });
    
    next();
  };
};

// Cleanup old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of ipRequestCounts.entries()) {
    if (now > data.resetTime) {
      ipRequestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export default {
  advancedRateLimit,
  securityAudit,
  validateApiKeyAccess,
  protectEndpoint,
  requestSizeLimit,
  securityHeaders,
  requestTimeout
};
