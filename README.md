# ZKBridge.app - Bitcoin-Ethereum Trustless Bridge

A full-stack application demonstrating a trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Bitcoin + Ethereum integration
- **ZK Proofs**: snarkjs for proof generation and verification

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ZKBridge.app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
# Using Docker (recommended)
npm run docker:up

# Or manually
npm run dev
```

## 📁 Project Structure

```
ZKBridge.app/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── shared/            # Shared types and utilities
├── docker-compose.yml # Docker development setup
└── package.json       # Root package configuration
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all applications for production
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run docker:up` - Start Docker development environment
- `npm run docker:down` - Stop Docker development environment

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/zkbridge"

# Ethereum
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
ETHEREUM_PRIVATE_KEY="your_private_key"

# Bitcoin
BITCOIN_RPC_URL="http://localhost:8332"
BITCOIN_RPC_USER="username"
BITCOIN_RPC_PASSWORD="password"

# Application
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔧 Features

- [x] Project structure and configuration
- [ ] Bitcoin transaction verification
- [ ] Merkle proof generation and verification
- [ ] ZK proof concept demonstration
- [ ] Ethereum smart contract interaction
- [ ] Wallet connection (MetaMask)
- [ ] Transaction history and status tracking
- [ ] Mobile-first responsive design
- [ ] Dark/light theme support

## 📱 Mobile-First Design

The application is built with a mobile-first approach using Tailwind CSS, ensuring optimal user experience across all devices.

## 🔐 Security

- Zero-knowledge proofs for privacy-preserving transactions
- Secure wallet integration
- Proper error handling and validation
- Environment-based configuration

## 📄 License

MIT License - see LICENSE file for details

