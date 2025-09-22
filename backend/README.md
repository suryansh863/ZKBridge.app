# ZKBridge Backend API

A comprehensive Node.js/Express backend for the Bitcoin-Ethereum trustless bridge with Zero-Knowledge proofs, featuring secure transaction verification, Merkle proof generation, and bridge orchestration.

## 🏗️ Architecture

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Bitcoin (testnet) + Ethereum integration
- **ZK Proofs**: snarkjs for proof generation and verification
- **Security**: Rate limiting, input sanitization, authentication
- **Logging**: Winston with structured logging

## 🚀 Features

### Core Functionality
- **Bitcoin Integration**: Full testnet support with transaction verification
- **Ethereum Integration**: Smart contract interaction and transaction handling
- **ZK Proofs**: Cryptographic proof generation and verification
- **Bridge Orchestration**: Complete bridge process management
- **Merkle Proofs**: Bitcoin transaction verification with Merkle trees

### Security Features
- **Rate Limiting**: Per-endpoint rate limiting with different tiers
- **Input Sanitization**: XSS, SQL injection, and path traversal protection
- **Authentication**: JWT tokens and API key support
- **CORS Protection**: Configurable cross-origin resource sharing
- **Request Validation**: Comprehensive input validation with express-validator

## 📡 API Endpoints

### Health & Status
```
GET  /api/health              - API health check
GET  /api/health/database     - Database health check
GET  /api/docs               - API documentation
```

### Bridge Operations
```
POST /api/bridge/initiate        - Start bridge process
GET  /api/bridge/status/:txId    - Check bridge status
GET  /api/bridge/transactions    - Get bridge transactions
POST /api/bridge/verify-source   - Manually verify source transaction
POST /api/bridge/cancel          - Cancel bridge transaction
GET  /api/bridge/stats           - Get bridge statistics
GET  /api/bridge/health          - Bridge service health check
```

### Bitcoin Integration
```
POST /api/bitcoin/verify              - Verify Bitcoin transaction
GET  /api/bitcoin/transaction/:txid   - Get Bitcoin transaction details
GET  /api/bitcoin/balance/:address    - Get Bitcoin balance
GET  /api/bitcoin/network-info        - Get Bitcoin network info
GET  /api/bitcoin/block-count         - Get current block count
POST /api/bitcoin/validate-address    - Validate Bitcoin address
```

### Merkle Proofs
```
POST /api/proofs/generate  - Generate Merkle proof
POST /api/proofs/verify    - Verify Merkle proof
```

### Ethereum Integration
```
GET  /api/ethereum/transaction/:hash  - Get Ethereum transaction details
POST /api/ethereum/verify             - Verify Ethereum transaction
GET  /api/ethereum/network-info       - Get Ethereum network info
GET  /api/ethereum/balance/:address   - Get Ethereum balance
GET  /api/ethereum/gas-price          - Get gas price
POST /api/ethereum/estimate-gas       - Estimate gas for transaction
```

### Zero-Knowledge Proofs
```
POST /api/zk/prove                    - Generate ZK proof
POST /api/zk/verify                   - Verify ZK proof
POST /api/zk/bridge-proof             - Generate bridge-specific ZK proof
POST /api/zk/verify-bridge-proof      - Verify bridge-specific ZK proof
POST /api/zk/demo/proof-of-knowledge  - Demo proof of knowledge
POST /api/zk/generate-witness         - Generate witness for circuit
GET  /api/zk/circuit-info             - Get circuit information
GET  /api/zk/health                   - ZK service health check
```

## 🔧 Technical Implementation

### Bitcoin Integration
- **bitcoinjs-lib**: Bitcoin transaction parsing and validation
- **bitcoin-core**: Bitcoin Core RPC client for testnet
- **Blockstream API**: Fallback for transaction data
- **Address Validation**: Support for P2PKH, P2SH, and Bech32 formats
- **Merkle Proofs**: Cryptographic verification of transaction inclusion

### Ethereum Integration
- **ethers.js**: Ethereum interaction and smart contract calls
- **Transaction Verification**: Full transaction validation
- **Gas Estimation**: Dynamic gas price calculation
- **Network Support**: Mainnet and testnet compatibility

### ZK Proof System
- **snarkjs**: Zero-knowledge proof generation and verification
- **Circuit Support**: Custom bridge verification circuits
- **Mock Implementation**: Development fallback when circuits unavailable
- **Proof Types**: General proofs and bridge-specific proofs

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bridge transactions table
CREATE TABLE bridge_transactions (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  source_tx_hash TEXT NOT NULL,
  source_amount TEXT NOT NULL,
  source_address TEXT NOT NULL,
  target_tx_hash TEXT,
  target_amount TEXT,
  target_address TEXT,
  zk_proof TEXT,
  merkle_proof TEXT,
  merkle_root TEXT,
  block_height INTEGER,
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id TEXT REFERENCES users(id)
);
```

## 🛡️ Security Implementation

### Rate Limiting
```typescript
// Different rate limits for different endpoints
const bitcoinRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

const zkRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window (computationally expensive)
});
```

### Input Sanitization
- **XSS Protection**: HTML/JavaScript pattern removal
- **SQL Injection**: SQL pattern detection and removal
- **NoSQL Injection**: MongoDB injection pattern protection
- **Path Traversal**: Directory traversal attack prevention
- **Null Byte Injection**: Null byte character removal

### Authentication
```typescript
// JWT Token Authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  // Verify JWT token
};

// API Key Authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  // Verify API key
};
```

## 🔍 Request/Response Examples

### Initiate Bridge
```bash
POST /api/bridge/initiate
Content-Type: application/json

{
  "fromChain": "bitcoin",
  "toChain": "ethereum",
  "sourceTxHash": "abc123...",
  "sourceAmount": "100000000",
  "sourceAddress": "bc1q...",
  "targetAddress": "0x1234...",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "bridge_tx_123",
    "status": "PENDING",
    "fromChain": "bitcoin",
    "toChain": "ethereum",
    "sourceTxHash": "abc123...",
    "amount": "100000000",
    "confirmations": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Bridge process initiated successfully"
}
```

### Verify Bitcoin Transaction
```bash
POST /api/bitcoin/verify
Content-Type: application/json

{
  "txid": "abc123...",
  "address": "bc1q...",
  "amount": 100000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "details": {
      "transaction": { ... },
      "inputAddresses": ["bc1q..."],
      "outputAddresses": ["bc1q..."],
      "confirmations": 6,
      "amountMatch": true,
      "addressMatch": true,
      "sufficientConfirmations": true
    }
  },
  "message": "Transaction verified successfully"
}
```

### Generate ZK Proof
```bash
POST /api/zk/prove
Content-Type: application/json

{
  "secret": "my-secret-data",
  "publicInput": "public-data",
  "additionalData": {
    "bridgeType": "bitcoin_to_ethereum"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proof": {
      "pi_a": ["1234...", "5678...", "1"],
      "pi_b": [["abcd..."], ["efgh..."], ["1", "0"]],
      "pi_c": ["ijkl...", "mnop...", "1"]
    },
    "publicSignals": ["public-data", "nonce123", "1642234567"]
  },
  "message": "ZK proof generated successfully"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Bitcoin Core (testnet) or Blockstream API access
- Ethereum RPC endpoint

### Installation
```bash
cd backend
npm install
```

### Environment Setup
```bash
cp env.example .env
# Edit .env with your configuration
```

### Database Setup
```bash
npm run db:push    # Push schema to database
npm run db:seed    # Seed with sample data
npm run db:studio  # Open Prisma Studio
```

### Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
```

### Testing
```bash
npm run test       # Run all tests
npm run test:watch # Run tests in watch mode
```

## 📊 Monitoring & Logging

### Structured Logging
```typescript
logger.info('Bridge transaction initiated', {
  txId: 'bridge_123',
  fromChain: 'bitcoin',
  toChain: 'ethereum',
  amount: '100000000'
});
```

### Health Checks
- **API Health**: Basic service availability
- **Database Health**: Connection and query testing
- **Blockchain Health**: Bitcoin/Ethereum node connectivity
- **ZK Service Health**: Circuit availability and proof generation

### Metrics
- Request/response times
- Error rates by endpoint
- Bridge transaction success rates
- ZK proof generation times

## 🔒 Security Considerations

### Production Deployment
- Use environment variables for all secrets
- Enable HTTPS with proper certificates
- Configure firewall rules
- Regular security updates
- Database encryption at rest
- API key rotation

### Input Validation
- All inputs validated with express-validator
- Address format validation for Bitcoin/Ethereum
- Amount validation with proper bounds checking
- Transaction hash format validation

### Error Handling
- Structured error responses
- No sensitive information in error messages
- Proper HTTP status codes
- Error logging without user data exposure

## 📈 Performance Optimization

### Caching
- Database query result caching
- Bitcoin/Ethereum API response caching
- ZK proof result caching
- Rate limit state caching

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization
- Regular maintenance tasks

### API Optimization
- Request compression
- Response caching headers
- Parallel processing where possible
- Efficient data serialization

## 🧪 Testing

### Unit Tests
- Service layer testing
- Utility function testing
- Validation logic testing
- Error handling testing

### Integration Tests
- API endpoint testing
- Database integration testing
- Blockchain integration testing
- ZK proof integration testing

### Load Testing
- Rate limiting verification
- Concurrent request handling
- Memory usage monitoring
- Response time benchmarking

## 📚 API Documentation

### Interactive Documentation
Visit `/api/docs` for complete API documentation with examples.

### Postman Collection
Import the provided Postman collection for easy API testing.

### OpenAPI Specification
Generate OpenAPI spec for automated documentation.

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits
- Comprehensive error handling
- Input validation on all endpoints

## 📄 License

MIT License - see LICENSE file for details.

