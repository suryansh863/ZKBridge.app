# Development Guide

This guide will help you set up and develop the ZKBridge application locally.

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

## Quick Start

1. **Clone and setup**:
```bash
git clone <repository-url>
cd ZKBridge.app
./setup.sh
```

2. **Configure environment**:
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Start development**:
```bash
# Using Docker (recommended)
npm run docker:up

# Or manually
npm run dev
```

## Project Structure

```
ZKBridge.app/
├── frontend/          # Next.js 14 frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/       # Utilities and hooks
│   │   └── types/     # TypeScript types
│   ├── public/        # Static assets
│   └── package.json
├── backend/           # Express.js API
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   ├── middleware/ # Express middleware
│   │   └── config/    # Configuration
│   ├── prisma/        # Database schema
│   └── package.json
├── shared/            # Shared types and utilities
│   ├── src/
│   │   ├── types/     # TypeScript interfaces
│   │   └── utils/     # Utility functions
│   └── package.json
├── circuits/          # ZK circuits
├── docker-compose.yml # Docker configuration
└── package.json       # Root package
```

## Development Workflow

### Backend Development

1. **Database setup**:
```bash
cd backend
npm run db:push      # Push schema to database
npm run db:seed      # Seed with sample data
npm run db:studio    # Open Prisma Studio
```

2. **API development**:
```bash
cd backend
npm run dev          # Start development server
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Development

1. **Component development**:
```bash
cd frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run lint         # Lint code
```

2. **Styling**:
- Uses Tailwind CSS with custom design system
- Dark/light theme support
- Mobile-first responsive design

### Shared Package

```bash
cd shared
npm run build        # Build shared types
npm run dev          # Watch mode
```

## API Endpoints

### Health Check
- `GET /api/health` - API health status
- `GET /api/health/database` - Database health

### Bridge Operations
- `GET /api/bridge` - List transactions
- `POST /api/bridge` - Create transaction
- `GET /api/bridge/:id` - Get transaction
- `PATCH /api/bridge/:id/status` - Update status

### Bitcoin Integration
- `GET /api/bitcoin/transaction/:txid` - Get transaction
- `POST /api/bitcoin/verify` - Verify transaction
- `POST /api/bitcoin/merkle-proof` - Generate Merkle proof
- `POST /api/bitcoin/verify-merkle-proof` - Verify Merkle proof

### Ethereum Integration
- `GET /api/ethereum/transaction/:hash` - Get transaction
- `POST /api/ethereum/verify` - Verify transaction
- `GET /api/ethereum/balance/:address` - Get balance
- `GET /api/ethereum/gas-price` - Get gas price

### ZK Proofs
- `POST /api/zk/generate-proof` - Generate proof
- `POST /api/zk/verify-proof` - Verify proof
- `POST /api/zk/demo/proof-of-knowledge` - Demo proof

## Database Schema

### Users
- `id` - Unique identifier
- `address` - Wallet address
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Bridge Transactions
- `id` - Unique identifier
- `direction` - Bridge direction (BITCOIN_TO_ETHEREUM, ETHEREUM_TO_BITCOIN)
- `status` - Transaction status (PENDING, CONFIRMED, FAILED, COMPLETED)
- `sourceTxHash` - Source transaction hash
- `sourceAmount` - Source amount
- `sourceAddress` - Source address
- `targetTxHash` - Target transaction hash (optional)
- `targetAmount` - Target amount (optional)
- `targetAddress` - Target address
- `zkProof` - ZK proof (optional)
- `merkleProof` - Merkle proof (optional)
- `merkleRoot` - Merkle root (optional)
- `blockHeight` - Block height (optional)
- `confirmations` - Number of confirmations
- `userId` - User ID (optional)

## Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Bitcoin
- `BITCOIN_NETWORK` - Network (testnet/mainnet)
- `BITCOIN_RPC_HOST` - RPC host
- `BITCOIN_RPC_PORT` - RPC port
- `BITCOIN_RPC_USER` - RPC username
- `BITCOIN_RPC_PASSWORD` - RPC password

### Ethereum
- `ETHEREUM_RPC_URL` - RPC URL
- `ETHEREUM_PRIVATE_KEY` - Private key for transactions
- `ETHEREUM_CHAIN_ID` - Chain ID

### Application
- `NODE_ENV` - Environment (development/production)
- `PORT` - Backend port
- `LOG_LEVEL` - Logging level

## Testing

### Backend Tests
```bash
cd backend
npm run test         # Run all tests
npm run test:watch   # Watch mode
```

### Frontend Tests
```bash
cd frontend
npm run test         # Run tests
```

## Deployment

### Docker Deployment
```bash
npm run docker:build # Build images
npm run docker:up    # Start services
```

### Manual Deployment
```bash
npm run build        # Build all packages
npm run start        # Start production servers
```

## Troubleshooting

### Common Issues

1. **Database connection failed**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Run `npm run db:push`

2. **Bitcoin RPC connection failed**:
   - Check Bitcoin node is running
   - Verify RPC credentials
   - Check network configuration

3. **Ethereum RPC connection failed**:
   - Check RPC URL is accessible
   - Verify chain ID
   - Check private key format

4. **Frontend build failed**:
   - Clear .next directory
   - Check TypeScript errors
   - Verify all dependencies installed

### Logs

- Backend logs: `backend/logs/`
- Docker logs: `docker-compose logs [service]`
- Frontend logs: Browser console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## Security

- Never commit private keys or secrets
- Use environment variables for sensitive data
- Regularly update dependencies
- Audit smart contracts before deployment
- Use proper ZK circuit trusted setup
