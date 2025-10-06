# 🚀 ZKBridge Sepolia Deployment Guide

## ✅ Deployment Status

**Current Status**: Ready to deploy to Sepolia testnet
**Wallet Address**: `0x59e702a8b62b8f4B96a6369D5B46499eD6160D70`
**Chain ID**: `11155111` (Sepolia)

## 📋 Prerequisites

### 1. Get Sepolia Test ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com)
- Enter your wallet address: `0x59e702a8b62b8f4B96a6369D5B46499eD6160D70`
- Request test ETH (you'll need ~0.1 ETH for deployment)

### 2. Get a Reliable RPC Endpoint

#### Option A: Infura (Recommended)
1. Go to [https://infura.io](https://infura.io)
2. Sign up/Login
3. Create new project → Web3 API → Ethereum
4. Copy your Project ID
5. RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

#### Option B: Alchemy
1. Go to [https://alchemy.com](https://alchemy.com)
2. Sign up/Login
3. Create new app → Ethereum → Sepolia
4. Copy your API key
5. RPC URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

## 🔧 Deployment Steps

### Step 1: Update Environment Variables

Update your `.env` file with the new RPC URL:

```bash
# Replace with your actual RPC URL
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
# or
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"

PRIVATE_KEY="0xd06ee9dc1b8959bdd134fad021fc9ab68a652a37b1c086b3e649b073a5ee74f1"
```

### Step 2: Deploy Contracts

```bash
cd /home/suryansh/Projects/ZKBridge.app/contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

**Expected Output:**
```
🚀 Starting deployment of ZKBridge contracts...
Deploying contracts with account: 0x59e702a8b62b8f4B96a6369D5B46499eD6160D70
Account balance: 0.1 ETH

📡 Deploying BTCRelay...
✅ BTCRelay deployed to: 0x...

💰 Deploying WrappedBTC...
✅ WrappedBTC deployed to: 0x...

🔐 Deploying ProofVerifier...
✅ ProofVerifier deployed to: 0x...

🌉 Deploying BridgeContract...
✅ BridgeContract deployed to: 0x...

🎉 Deployment completed successfully!
```

### Step 3: Verify Contracts (Optional)

```bash
# Get Etherscan API key from https://etherscan.io/apis
ETHERSCAN_API_KEY="your_etherscan_api_key"

# Verify each contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Step 4: Update Frontend Configuration

After successful deployment, update your frontend configuration:

```bash
# Update .env file
NEXT_PUBLIC_CHAIN_ID="11155111"
NEXT_PUBLIC_CONTRACT_ADDRESS="YOUR_BRIDGE_CONTRACT_ADDRESS"
NEXT_PUBLIC_RPC_URL="YOUR_SEPOLIA_RPC_URL"
```

### Step 5: Test Deployment

```bash
# Start the application
npm run dev

# Test the bridge interface
# Open http://localhost:3000/bridge
```

## 📊 Contract Details

### Deployed Contracts

| Contract | Purpose | Address |
|----------|---------|---------|
| BTCRelay | Bitcoin block header verification | `0x...` |
| WrappedBTC | ERC-20 token for bridged Bitcoin | `0x...` |
| ProofVerifier | ZK proof verification | `0x...` |
| BridgeContract | Main bridge logic | `0x...` |

### Configuration

- **Token Name**: ZK Bridge Bitcoin
- **Token Symbol**: ZKBTC
- **Bridge Fee**: 30 basis points (0.3%)
- **Min Bridge Amount**: 0.00001 BTC
- **Max Bridge Amount**: 1,000,000 BTC

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid project id"**: Your RPC URL is incorrect
2. **"Insufficient funds"**: Need more Sepolia ETH
3. **"Headers timeout"**: RPC endpoint is slow/unreliable

### Solutions

1. **Double-check RPC URL**: Ensure it's correctly formatted
2. **Get more test ETH**: Use multiple faucets
3. **Try different RPC**: Switch between Infura/Alchemy

## 🎯 Next Steps After Deployment

1. **Test Bridge Functionality**
   - Connect MetaMask to Sepolia
   - Test Bitcoin → Ethereum bridge
   - Test Ethereum → Bitcoin bridge

2. **Monitor Contracts**
   - Set up alerts for contract events
   - Monitor gas usage and fees

3. **Frontend Integration**
   - Update contract addresses in frontend
   - Test user interface

4. **Security Audit**
   - Review contract interactions
   - Test edge cases

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify your RPC endpoint
3. Ensure you have sufficient test ETH
4. Check contract deployment logs

---

**Ready to deploy?** Just get your RPC endpoint and Sepolia ETH, then run the deployment command! 🚀
