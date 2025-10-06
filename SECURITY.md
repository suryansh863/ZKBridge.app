# ZKBridge Security Documentation

## 🔒 Security Overview

The ZKBridge API implements comprehensive security measures to protect against common web vulnerabilities and ensure secure blockchain operations.

## 🛡️ Security Features

### 1. **Authentication & Authorization**

#### API Key System
- **Admin API Keys**: Full administrative access
- **Full API Keys**: Complete access to all endpoints
- **Read-only API Keys**: Limited to read-only operations

```bash
# Example API Keys (Generated)
Admin: zkb_ae9a55e57f6c5efb139f73c7e2da6eae0f602a58e0fc948d660d520d87e52f54
Full:   zkb_d3a2ea8fb6c6a28e8cb93c61c2ff501a20d10b2d74f6b9586142a1a63e7802d8
Read:   zkb_d3047f2c10fecc1251b5ee90c71da8479319f13450ff7df0028b2832b53c5133
```

#### Usage
```bash
# Using API Key
curl -H "X-API-Key: zkb_ae9a55e57f6c5efb139f73c7e2da6eae0f602a58e0fc948d660d520d87e52f54" \
     http://localhost:3001/api/health

# Using JWT Token
curl -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3001/api/bridge/transactions
```

### 2. **Rate Limiting**

#### Global Rate Limits
- **Default**: 100 requests per 15 minutes per IP
- **ZK Endpoints**: 20 requests per 15 minutes per IP
- **Bridge Endpoints**: 50 requests per 15 minutes per IP

#### Advanced Rate Limiting
- IP-based tracking with automatic cleanup
- Suspicious IP detection and blocking
- Endpoint-specific limits

### 3. **Input Validation & Sanitization**

#### Protection Against:
- **XSS Attacks**: HTML/JavaScript injection
- **SQL Injection**: Database query manipulation
- **NoSQL Injection**: Document database attacks
- **Path Traversal**: Directory traversal attempts
- **Command Injection**: System command execution

#### Validation Features:
- Bitcoin address validation
- Ethereum address validation
- Transaction hash validation
- Amount validation
- Request size limits (10MB max)

### 4. **Security Headers**

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
X-ZKBridge-Security: enabled
```

### 5. **CORS Configuration**

- **Allowed Origins**: Configurable via environment variables
- **Credentials**: Enabled for authenticated requests
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization, X-API-Key, X-Requested-With

### 6. **Security Audit & Monitoring**

#### Suspicious Activity Detection:
- Pattern matching for malicious requests
- User-Agent analysis
- Request frequency monitoring
- Risk scoring system

#### Logging:
- All security events logged
- IP tracking and blocking
- Request/response monitoring
- Error tracking with context

## 🔧 Configuration

### Environment Variables

```bash
# API Security Keys
API_KEYS="zkb_key1,zkb_key2,zkb_key3"
ADMIN_API_KEYS="zkb_admin_key"
READONLY_API_KEYS="zkb_read_key"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"
ZK_RATE_LIMIT_MAX="20"
BRIDGE_RATE_LIMIT_MAX="50"

# Security Features
ENABLE_SECURITY_AUDIT="true"
BLOCK_SUSPICIOUS_IPS="true"
ENABLE_REQUEST_LOGGING="true"

# Request Limits
MAX_REQUEST_SIZE="10485760"    # 10MB
REQUEST_TIMEOUT="30000"        # 30 seconds

# JWT Configuration
JWT_SECRET="your-secure-jwt-secret"
ENCRYPTION_KEY="your-encryption-key"
```

## 🚨 Security Endpoints

### Security Status
```bash
GET /api/security/status
```

**Response:**
```json
{
  "success": true,
  "message": "Security status",
  "timestamp": "2025-10-06T17:30:00.000Z",
  "security": {
    "rateLimiting": "Active",
    "inputSanitization": "Active",
    "securityHeaders": "Active",
    "suspiciousIPBlocking": "Active",
    "securityAudit": "Active",
    "cors": "Active",
    "requestSizeLimit": "Active",
    "requestTimeout": "Active"
  }
}
```

### API Documentation
```bash
GET /api/docs
```

Returns complete API documentation including security information.

## 🔍 Security Monitoring

### Logs to Monitor

1. **Security Events**
   - Failed authentication attempts
   - Rate limit violations
   - Suspicious request patterns
   - Blocked IP addresses

2. **Error Logs**
   - Input validation failures
   - Sanitization errors
   - Request timeout events

3. **Access Logs**
   - API endpoint usage
   - User agent analysis
   - Request frequency patterns

### Monitoring Commands

```bash
# Check security status
curl http://localhost:3001/api/security/status

# Monitor logs
tail -f apps/api/logs/combined.log | grep -E "(SECURITY|WARN|ERROR)"

# Check rate limiting
curl -H "X-API-Key: your-key" http://localhost:3001/api/health
```

## 🛠️ Security Best Practices

### For Developers

1. **Always use HTTPS in production**
2. **Rotate API keys regularly**
3. **Implement proper error handling**
4. **Validate all inputs**
5. **Use environment variables for secrets**
6. **Monitor security logs**

### For API Users

1. **Keep API keys secure**
2. **Use appropriate access levels**
3. **Respect rate limits**
4. **Validate responses**
5. **Report suspicious activity**

## 🔐 Production Security Checklist

- [ ] HTTPS enabled with valid certificates
- [ ] Strong JWT secrets configured
- [ ] API keys rotated and secured
- [ ] Rate limiting tuned for production load
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] Input validation active
- [ ] Logging and monitoring enabled
- [ ] Database connections encrypted
- [ ] Regular security updates
- [ ] Backup and recovery procedures
- [ ] Incident response plan

## 🚨 Incident Response

### If Security Breach Detected:

1. **Immediate Actions**
   - Block suspicious IPs
   - Rotate compromised API keys
   - Review access logs
   - Notify relevant parties

2. **Investigation**
   - Analyze attack vectors
   - Review affected endpoints
   - Check for data compromise
   - Document findings

3. **Recovery**
   - Patch vulnerabilities
   - Update security measures
   - Restore services
   - Monitor for reoccurrence

## 📞 Security Contacts

- **Security Issues**: Report to development team
- **Emergency**: Follow incident response procedures
- **General Security**: Review this documentation

---

**Last Updated**: October 6, 2025
**Version**: 1.0.0
**Status**: Production Ready
