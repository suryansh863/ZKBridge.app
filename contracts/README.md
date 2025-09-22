# ZKBridge Smart Contracts

This directory contains the Solidity smart contracts for the ZKBridge - a trustless Bitcoin-Ethereum bridge using Zero-Knowledge proofs.

## 📋 Contract Overview

### Core Contracts

1. **BTCRelay.sol** - Bitcoin header verification using SPV proofs
2. **WrappedBTC.sol** - ERC20 token representing Bitcoin on Ethereum
3. **ProofVerifier.sol** - Zero-Knowledge proof verification
4. **BridgeContract.sol** - Main bridging logic orchestrating the entire process

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Bitcoin       │    │   Ethereum       │    │   ZK Proofs     │
│   Network       │    │   Network        │    │   Verification  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   BTCRelay      │    │   WrappedBTC     │    │   ProofVerifier │
│   (SPV Proofs)  │    │   (ERC20 Token)  │    │   (ZK Proofs)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────┐
                    │  BridgeContract  │
                    │  (Orchestration) │
                    └──────────────────┘
```

## 🔧 Key Features

### Security Features
- **Reentrancy Protection** - All external calls protected
- **Access Control** - Role-based permissions system
- **Circuit Breakers** - Emergency pause functionality
- **Input Validation** - Comprehensive parameter validation
- **Overflow Protection** - SafeMath for arithmetic operations

### Bitcoin Integration
- **SPV Proofs** - Simplified Payment Verification
- **Merkle Proof Verification** - Transaction inclusion proofs
- **Block Header Validation** - Bitcoin blockchain verification
- **Difficulty Adjustment** - Automatic difficulty recalculation

### Ethereum Integration
- **ERC20 Standard** - WrappedBTC follows ERC20 specification
- **Voting Rights** - ERC20Votes for governance participation
- **Pausable** - Emergency stop functionality
- **Burnable** - Token destruction capabilities

### ZK Proof Integration
- **Multiple Circuits** - Support for different proof types
- **Batch Verification** - Efficient batch processing
- **Circuit Management** - Dynamic circuit configuration
- **Proof Validation** - Comprehensive proof verification

## 📁 File Structure

```
contracts/
├── contracts/
│   ├── BTCRelay.sol           # Bitcoin header verification
│   ├── WrappedBTC.sol         # ERC20 Bitcoin representation
│   ├── ProofVerifier.sol      # ZK proof verification
│   └── BridgeContract.sol     # Main bridge logic
├── test/
│   ├── BTCRelay.test.ts       # BTCRelay tests
│   ├── WrappedBTC.test.ts     # WrappedBTC tests
│   ├── ProofVerifier.test.ts  # ProofVerifier tests
│   └── BridgeContract.test.ts # BridgeContract tests
├── scripts/
│   ├── deploy.ts              # Deployment script
│   └── verify.ts              # Contract verification
├── hardhat.config.ts          # Hardhat configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Hardhat

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Deployment

```bash
# Deploy to local network
npm run deploy:local

# Deploy to testnet
npm run deploy:testnet

# Verify contracts
npm run verify
```

## 📖 Contract Details

### BTCRelay.sol

**Purpose**: Maintains a chain of Bitcoin block headers and verifies Merkle proofs.

**Key Functions**:
- `addBlockHeader()` - Add new Bitcoin block headers
- `verifyMerkleProof()` - Verify Merkle proofs for transactions
- `verifyAndRecordTransaction()` - Record verified transactions
- `adjustDifficulty()` - Adjust mining difficulty

**Security Features**:
- Genesis block validation
- Block continuity verification
- Timestamp validation
- Difficulty adjustment limits

### WrappedBTC.sol

**Purpose**: ERC20 token representing Bitcoin on Ethereum.

**Key Functions**:
- `mint()` - Mint tokens when Bitcoin is locked
- `burn()` - Burn tokens when Bitcoin is unlocked
- `emergencyMint()` - Emergency minting capability
- `emergencyBurn()` - Emergency burning capability

**Security Features**:
- Maximum supply limits
- Minimum/maximum mint amounts
- Emergency pause functionality
- Access control for minting/burning

### ProofVerifier.sol

**Purpose**: Verifies Zero-Knowledge proofs for Bitcoin transactions.

**Key Functions**:
- `submitProof()` - Submit ZK proofs for verification
- `verifyProof()` - Verify submitted proofs
- `batchVerifyProofs()` - Batch verification for efficiency
- `updateCircuit()` - Update circuit configurations

**Security Features**:
- Proof size validation
- Public input limits
- Circuit configuration management
- Verification timeout protection

### BridgeContract.sol

**Purpose**: Orchestrates the entire bridging process.

**Key Functions**:
- `initiateBridge()` - Start a new bridge transaction
- `processBridge()` - Process verified Bitcoin transactions
- `claimBitcoin()` - Claim Bitcoin from completed bridges
- `cancelBridge()` - Cancel failed bridge transactions

**Security Features**:
- Transaction validation
- Fee calculation
- Status tracking
- Emergency controls

## 🔒 Security Considerations

### Access Control
- **Admin Role**: Full system control
- **Operator Role**: Bridge operations
- **Relayer Role**: Bitcoin data submission
- **Verifier Role**: ZK proof verification

### Circuit Breakers
- Emergency pause functionality
- Time-based emergency checks
- Admin-only emergency controls
- Automatic recovery mechanisms

### Input Validation
- Parameter range checks
- Address validation
- Hash verification
- Amount limits

### Economic Security
- Bridge fees (0.3% default)
- Minimum/maximum amounts
- Fee collection mechanisms
- Economic incentives for relayers

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
- **Solidity 0.8.19** - Latest stable version
- **Optimizer Enabled** - 200 runs for gas efficiency
- **viaIR** - Intermediate representation optimization
- **Packed Structs** - Efficient storage layout
- **Batch Operations** - Reduced transaction costs

### Gas Usage Estimates
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

### Mainnet (Future)
- **Ethereum Mainnet** - Production deployment
- **Bitcoin Mainnet** - Production Bitcoin integration

## 📝 Configuration

### Environment Variables
```bash
# Network configuration
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Deployment
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporting
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

### Hardhat Configuration
- **Solidity Version**: 0.8.19
- **Optimizer**: Enabled (200 runs)
- **viaIR**: Enabled for better optimization
- **Gas Reporter**: Configured for cost analysis

## 🚨 Emergency Procedures

### Emergency Pause
1. Admin calls `emergencyPause()` on affected contracts
2. System enters emergency mode
3. All operations are suspended
4. Investigation and remediation
5. Admin calls `resume()` after 24-hour interval

### Emergency Withdraw
1. System must be in emergency mode
2. Admin calls `emergencyWithdraw()`
3. Funds are transferred to designated address
4. Event is emitted for transparency

## 📈 Monitoring

### Key Metrics
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

## 🔧 Development

### Adding New Features
1. Create feature branch
2. Implement changes with tests
3. Run full test suite
4. Update documentation
5. Submit pull request

### Code Standards
- Solidity Style Guide compliance
- Comprehensive test coverage
- Gas optimization
- Security best practices
- Clear documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📞 Support

For questions or issues:
- Create GitHub issue
- Join Discord community
- Check documentation
- Review test cases

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Always test thoroughly before mainnet deployment.
