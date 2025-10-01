# 🚀 Smart Contract Deployment Guide

## ⚠️ **IMPORTANT: You Need a Private Key to Deploy**

The error you're seeing is because the `PRIVATE_KEY` in your `.env` file is set to `"your_private_key_here"` (placeholder).

## 🔧 **Step 1: Get a Private Key**

### Option A: Create a New Wallet (Recommended for Testing)
1. **Install MetaMask** (if you don't have it)
2. **Create a new account** (for testing only - don't use your main wallet)
3. **Export the private key**:
   - Click on account name → Account details → Export private key
   - **⚠️ NEVER share this private key with anyone!**

### Option B: Use a Test Wallet Generator
```bash
# Generate a test private key (for development only)
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

## 🔧 **Step 2: Get Sepolia ETH**

You need Sepolia ETH to pay for gas fees:

1. **Sepolia Faucets** (get free test ETH):
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/
   - https://sepolia-faucet.pk910.de/

2. **Enter your wallet address** and request test ETH

## 🔧 **Step 3: Update Your .env File**

```bash
# Replace with your actual private key (without 0x prefix)
PRIVATE_KEY="your_actual_private_key_here"

# Optional: Add Etherscan API key for contract verification
ETHERSCAN_API_KEY="your_etherscan_api_key"
```

## 🚀 **Step 4: Deploy Contracts**

```bash
cd contracts
npm run deploy:sepolia
```

## 📋 **What Will Be Deployed**

1. **BTCRelay** - Bitcoin transaction verification
2. **WrappedBTC** - ERC-20 token representing Bitcoin
3. **ProofVerifier** - ZK proof verification
4. **BridgeContract** - Main bridge logic

## 🔍 **After Deployment**

The script will output:
- Contract addresses
- Transaction hashes
- Verification commands

## ⚠️ **Security Notes**

- **Never commit your private key to git**
- **Use a test wallet only**
- **Don't use real ETH on testnet**
- **Keep your private key secure**

## 🆘 **If You Get Errors**

1. **"Insufficient funds"** → Get more Sepolia ETH from faucets
2. **"Nonce too low"** → Wait a few minutes and try again
3. **"Gas estimation failed"** → Check your private key format

## 🎯 **Quick Start (If You Want to Skip Deployment)**

If you just want to test the app without deploying contracts:

1. The app works with **mock contracts** for development
2. All features work except actual blockchain transactions
3. You can test the UI, wallet connection, and data flow

---

**Ready to deploy? Just update your private key in `.env` and run the deployment command!** 🚀
