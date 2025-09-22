# ZKBridge Smart Contracts Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (recommended: Node.js 18+)
- npm or yarn
- Hardhat CLI
- Git

### Installation
```bash
cd contracts
npm install
```

### Compilation
```bash
npm run compile
```

### Testing
```bash
npm test
```

### Deployment
```bash
# Deploy to local network
npm run deploy:local

# Deploy to testnet (Goerli/Sepolia)
npm run deploy:testnet

# Verify contracts on block explorer
npm run verify
```

## 📋 Contract Overview

### Core Contracts Deployed

1. **BTCRelay** - Bitcoin header verification using SPV proofs
2. **WrappedBTC** - ERC20 token representing Bitcoin on Ethereum  
3. **ProofVerifier** - Zero-Knowledge proof verification
4. **BridgeContract** - Main bridging logic orchestrating the entire process

### Contract Addresses

After deployment, you'll get addresses like:
```
BTCRelay: 0x...
WrappedBTC: 0x...
ProofVerifier: 0x...
BridgeContract: 0x...
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
```bash
# Network RPC URLs
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Deployment
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporting
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true
```

### Network Configuration

The contracts are configured for:
- **Local Development**: Hardhat network (chainId: 1337)
- **Testnets**: Goerli, Sepolia
- **Mainnet**: Ready for production deployment

## 🛡️ Security Features

### Access Control
- **Admin Role**: Full system control
- **Operator Role**: Bridge operations
- **Relayer Role**: Bitcoin data submission
- **Verifier Role**: ZK proof verification

### Security Measures
- ✅ Reentrancy protection
- ✅ Access control with roles
- ✅ Emergency pause functionality
- ✅ Input validation and sanitization
- ✅ Circuit breaker patterns
- ✅ Rate limiting capabilities
- ✅ Overflow/underflow protection

### Economic Security
- Bridge fees: 0.3% (configurable)
- Minimum bridge amount: 1,000 satoshis
- Maximum bridge amount: 1,000,000 BTC
- Fee collection and distribution

## 🧪 Testing

### Test Coverage
- Unit tests for all contracts
- Integration tests for bridge flow
- Security tests for edge cases
- Gas optimization tests

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/BTCRelay.test.ts

# Run tests with gas reporting
npm run gas-report

# Run tests with coverage
npm run test:coverage
```

## 📊 Gas Optimization

### Optimizations Applied
- Solidity 0.8.20 with optimizer enabled
- viaIR for better optimization
- Packed structs for efficient storage
- Batch operations for reduced costs

### Estimated Gas Usage
- BTCRelay deployment: ~2.5M gas
- WrappedBTC deployment: ~3.2M gas
- ProofVerifier deployment: ~2.8M gas
- BridgeContract deployment: ~3.5M gas

## 🔄 Bridge Flow

### Bitcoin to Ethereum
1. User sends Bitcoin to designated address
2. Relayer submits block header to BTCRelay
3. Relayer submits Merkle proof for transaction
4. ZK proof is generated and verified
5. BridgeContract processes the transaction
6. WrappedBTC tokens are minted to user

### Ethereum to Bitcoin
1. User burns WrappedBTC tokens
2. BridgeContract records the burn
3. Operator claims Bitcoin from bridge
4. Bitcoin is sent to user's address

## 🌐 Network Support

### Testnets
- **Goerli** - Ethereum testnet
- **Sepolia** - Ethereum testnet
- **Bitcoin Testnet** - Bitcoin testnet

### Mainnet (Production Ready)
- **Ethereum Mainnet** - Production deployment
- **Bitcoin Mainnet** - Production Bitcoin integration

## 📝 Post-Deployment Steps

### 1. Verify Contracts
```bash
npm run verify
```

### 2. Configure Roles
```javascript
// Grant relayer role
await btcRelay.addRelayer(relayerAddress);

// Grant operator role
await bridgeContract.addOperator(operatorAddress);

// Grant verifier role
await proofVerifier.addVerifier(verifierAddress);
```

### 3. Set Bridge Contract
```javascript
await wrappedBTC.setBridgeContract(bridgeContractAddress);
```

### 4. Configure Circuits
```javascript
await proofVerifier.updateCircuit(
  circuitId,
  verificationKey,
  maxPublicInputs,
  proofSize,
  true // active
);
```

### 5. Test Bridge Operations
```javascript
// Initiate bridge
const bridgeId = await bridgeContract.initiateBridge(
  amount,
  btcTxHash,
  btcAddress,
  ethAddress
);

// Process bridge
await bridgeContract.processBridge(
  bridgeId,
  merkleProof,
  zkProof
);
```

## 🚨 Emergency Procedures

### Emergency Pause
```javascript
await bridgeContract.emergencyPause();
```

### Emergency Withdraw
```javascript
await bridgeContract.emergencyWithdraw(
  tokenAddress,
  amount,
  recipientAddress
);
```

### Resume Operations
```javascript
await bridgeContract.resume();
```

## 📈 Monitoring

### Key Metrics to Monitor
- Bridge transaction volume
- Fee collection
- Active bridge count
- Failed bridge count
- Gas usage patterns

### Events to Monitor
- `BridgeInitiated`
- `BridgeCompleted`
- `BridgeClaimed`
- `BridgeCancelled`
- `ProofVerified`
- `BlockHeaderAdded`

## 🔧 Maintenance

### Regular Tasks
- Monitor bridge operations
- Update circuit configurations
- Manage relayer addresses
- Review security parameters
- Update documentation

### Upgrade Considerations
- Contract upgrades (if using proxy patterns)
- Circuit updates
- Parameter adjustments
- Security patches

## 📞 Support

### Resources
- GitHub repository
- Documentation
- Test cases
- Community Discord

### Getting Help
1. Check documentation
2. Review test cases
3. Create GitHub issue
4. Join Discord community

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always test thoroughly before mainnet deployment. The contracts are designed for educational and testing purposes.

---

**Happy Bridging! 🌉**
