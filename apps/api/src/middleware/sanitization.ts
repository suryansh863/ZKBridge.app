import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Dangerous characters and patterns to sanitize
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi,
  /<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi,
  /<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi,
  /<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi,
  /<a\b[^<]*(?:(?!<\/a>)<[^<]*)*<\/a>/gi,
  /<img\b[^<]*(?:(?!<\/img>)<[^<]*)*<\/img>/gi,
  /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi,
  /<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi,
  /<audio\b[^<]*(?:(?!<\/audio>)<[^<]*)*<\/audio>/gi,
  /<source\b[^<]*(?:(?!<\/source>)<[^<]*)*<\/source>/gi,
  /<track\b[^<]*(?:(?!<\/track>)<[^<]*)*<\/track>/gi,
  /<map\b[^<]*(?:(?!<\/map>)<[^<]*)*<\/map>/gi,
  /<area\b[^<]*(?:(?!<\/area>)<[^<]*)*<\/area>/gi,
  /<base\b[^<]*(?:(?!<\/base>)<[^<]*)*<\/base>/gi,
  /<col\b[^<]*(?:(?!<\/col>)<[^<]*)*<\/col>/gi,
  /<colgroup\b[^<]*(?:(?!<\/colgroup>)<[^<]*)*<\/colgroup>/gi,
  /<frame\b[^<]*(?:(?!<\/frame>)<[^<]*)*<\/frame>/gi,
  /<frameset\b[^<]*(?:(?!<\/frameset>)<[^<]*)*<\/frameset>/gi,
  /<noframes\b[^<]*(?:(?!<\/noframes>)<[^<]*)*<\/noframes>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  /<param\b[^<]*(?:(?!<\/param>)<[^<]*)*<\/param>/gi,
  /<isindex\b[^<]*(?:(?!<\/isindex>)<[^<]*)*<\/isindex>/gi,
  /<listing\b[^<]*(?:(?!<\/listing>)<[^<]*)*<\/listing>/gi,
  /<plaintext\b[^<]*(?:(?!<\/plaintext>)<[^<]*)*<\/plaintext>/gi,
  /<xmp\b[^<]*(?:(?!<\/xmp>)<[^<]*)*<\/xmp>/gi,
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*=\s*[\w\s]*)/gi,
  /(;\s*(DROP|DELETE|INSERT|UPDATE|SELECT))/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*LIKE\s*[\w\s]*)/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*IN\s*\([^)]*\))/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*BETWEEN\s*[\w\s]*\s*AND\s*[\w\s]*)/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*EXISTS\s*\([^)]*\))/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*NOT\s+[\w\s]*)/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*IS\s+NULL)/gi,
  /(\b(OR|AND)\s+[\w\s]*\s*IS\s+NOT\s+NULL)/gi,
];

// NoSQL injection patterns
const NOSQL_INJECTION_PATTERNS = [
  /\$where/gi,
  /\$ne/gi,
  /\$gt/gi,
  /\$gte/gi,
  /\$lt/gi,
  /\$lte/gi,
  /\$in/gi,
  /\$nin/gi,
  /\$exists/gi,
  /\$regex/gi,
  /\$or/gi,
  /\$and/gi,
  /\$not/gi,
  /\$nor/gi,
  /\$all/gi,
  /\$elemMatch/gi,
  /\$size/gi,
  /\$type/gi,
  /\$mod/gi,
  /\$text/gi,
  /\$geoWithin/gi,
  /\$geoIntersects/gi,
  /\$near/gi,
  /\$nearSphere/gi,
  /\$center/gi,
  /\$centerSphere/gi,
  /\$box/gi,
  /\$polygon/gi,
  /\$geometry/gi,
  /\$maxDistance/gi,
  /\$minDistance/gi,
  /\$uniqueDocs/gi,
  /\$returnKey/gi,
  /\$showDiskLoc/gi,
  /\$hint/gi,
  /\$comment/gi,
  /\$explain/gi,
  /\$snapshot/gi,
  /\$orderby/gi,
  /\$natural/gi,
  /\$slice/gi,
  /\$meta/gi,
  /\$query/gi,
  /\$isolated/gi,
  /\$readPreference/gi,
  /\$maxTimeMS/gi,
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /\.\.%2f/gi,
  /\.\.%5c/gi,
  /\.\.%252f/gi,
  /\.\.%255c/gi,
  /\.\.%c0%af/gi,
  /\.\.%c1%9c/gi,
  /\.\.%c0%2f/gi,
  /\.\.%c1%af/gi,
];

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return input;
  }

  let sanitized = input;

  // Remove dangerous HTML/JavaScript patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove SQL injection patterns
  SQL_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove NoSQL injection patterns
  NOSQL_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove path traversal patterns
  PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    // Sanitize headers (except authorization and api-key)
    if (req.headers && typeof req.headers === 'object') {
      const sanitizedHeaders: any = {};
      for (const key in req.headers) {
        if (Object.prototype.hasOwnProperty.call(req.headers, key)) {
          // Skip sensitive headers
          if (key.toLowerCase() === 'authorization' || 
              key.toLowerCase() === 'x-api-key' ||
              key.toLowerCase() === 'cookie') {
            sanitizedHeaders[key] = req.headers[key];
          } else {
            sanitizedHeaders[key] = sanitizeInput(String(req.headers[key]));
          }
        }
      }
      req.headers = sanitizedHeaders;
    }

    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    return res.status(400).json({
      success: false,
      error: 'Input sanitization failed',
      message: 'Invalid input data detected'
    });
  }
};

export const validateBitcoinAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Bitcoin address patterns
  const patterns = [
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // P2PKH (Legacy)
    /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,     // P2SH (Script Hash)
    /^bc1[a-z0-9]{39,59}$/,               // Bech32 (Native SegWit)
    /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Testnet P2PKH
    /^2[a-km-zA-HJ-NP-Z1-9]{25,34}$/,     // Testnet P2SH
    /^tb1[a-z0-9]{39,59}$/                // Testnet Bech32
  ];

  return patterns.some(pattern => pattern.test(address));
};

export const validateEthereumAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Ethereum address pattern (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateTransactionHash = (hash: string): boolean => {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // Bitcoin transaction hash (64 hex characters)
  const bitcoinPattern = /^[a-fA-F0-9]{64}$/;
  
  // Ethereum transaction hash (0x followed by 64 hex characters)
  const ethereumPattern = /^0x[a-fA-F0-9]{64}$/;

  return bitcoinPattern.test(hash) || ethereumPattern.test(hash);
};

export const validateAmount = (amount: string | number): boolean => {
  if (amount === null || amount === undefined) {
    return false;
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return !isNaN(numAmount) && numAmount > 0 && isFinite(numAmount);
};

export const rateLimitByIP = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const requestData = requests.get(ip);
    
    if (!requestData || now > requestData.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (requestData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`
      });
    }

    requestData.count++;
    next();
  };
};

