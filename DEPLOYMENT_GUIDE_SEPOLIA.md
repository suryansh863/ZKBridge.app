# BridgeSpark - Sepolia Testnet Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Sepolia ETH** - Get free testnet ETH from:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://sepolia-faucet.pk910.de/

2. **Infura/Alchemy Account** - Get RPC URL:
   - Infura: https://infura.io/ (create project, copy Sepolia endpoint)
   - Alchemy: https://alchemy.com/ (create app, copy Sepolia RPC URL)

3. **Etherscan API Key** (for verification):
   - https://etherscan.io/apis (create free account, generate API key)

4. **MetaMask Wallet** - Export your private key:
   - Click account → Account Details → Export Private Key
   - **⚠️ NEVER share this or commit it to git!**

---

## Step 1: Configure Environment

Create `.env` file in the `contracts/` directory:

```bash
cd contracts
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
PRIVATE_KEY="your_private_key_without_0x_prefix"
ETHERSCAN_API_KEY="your_etherscan_api_key"

TOKEN_NAME="BridgeSpark Bitcoin"
TOKEN_SYMBOL="BSBTC"
```

---

## Step 2: Install Dependencies

```bash
cd /Users/yashswisingh/ZKBridge.app/contracts
npm install
```

---

## Step 3: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 4 Solidity files successfully
```

---

## Step 4: Run Tests (Optional but Recommended)

```bash
npm test
```

This ensures all contracts work correctly before deployment.

---

## Step 5: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

This will:
1. Deploy BTCRelay contract
2. Deploy WrappedBTC (ERC-20) contract
3. Deploy ProofVerifier contract
4. Deploy BridgeContract
5. Configure all contracts (set roles, permissions)
6. Save deployment addresses to `deployments/sepolia-latest.json`
7. Generate `.env.contracts` file for backend

**Expected Duration:** 2-5 minutes  
**Expected Cost:** 0.01-0.03 Sepolia ETH

---

## Step 6: Verify Contracts on Etherscan

After deployment completes, the script will show verification commands. Run them:

```bash
# Example (use actual addresses from deployment output):
npx hardhat verify --network sepolia 0xYOUR_BTC_RELAY_ADDRESS "0x000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943" 1296688602

npx hardhat verify --network sepolia 0xYOUR_WRAPPED_BTC_ADDRESS "BridgeSpark Bitcoin" "BSBTC" "0xYOUR_DEPLOYER_ADDRESS"

npx hardhat verify --network sepolia 0xYOUR_PROOF_VERIFIER_ADDRESS

npx hardhat verify --network sepolia 0xYOUR_BRIDGE_CONTRACT_ADDRESS "0xBTC_RELAY_ADDRESS" "0xWRAPPED_BTC_ADDRESS" "0xPROOF_VERIFIER_ADDRESS"
```

---

## Step 7: Update Backend Configuration

The deployment script automatically creates `.env.contracts` in the project root. Merge it with your main `.env`:

```bash
cd /Users/yashswisingh/ZKBridge.app
cat .env.contracts >> .env
```

---

## Step 8: Update Frontend Configuration

Create/update `apps/web/.env.local`:

```bash
cd apps/web
cat > .env.local << EOF
NEXT_PUBLIC_BTC_RELAY_ADDRESS="0xYOUR_BTC_RELAY_ADDRESS"
NEXT_PUBLIC_WRAPPED_BTC_ADDRESS="0xYOUR_WRAPPED_BTC_ADDRESS"
NEXT_PUBLIC_PROOF_VERIFIER_ADDRESS="0xYOUR_PROOF_VERIFIER_ADDRESS"
NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS="0xYOUR_BRIDGE_CONTRACT_ADDRESS"
NEXT_PUBLIC_ETHEREUM_NETWORK="sepolia"
NEXT_PUBLIC_ETHEREUM_CHAIN_ID="11155111"
EOF
```

---

## Step 9: Restart Services

```bash
cd /Users/yashswisingh/ZKBridge.app
npm run dev
```

---

## Deployment Artifacts

After deployment, you'll find:

1. **Contract Addresses**: `contracts/deployments/sepolia-latest.json`
2. **Backend Config**: `.env.contracts` (at project root)
3. **ABI Files**: `contracts/artifacts/contracts/`
4. **Deployment History**: `contracts/deployments/sepolia-{timestamp}.json`

---

## Troubleshooting

### Issue: "Insufficient funds"
**Solution**: Get more Sepolia ETH from faucets listed above

### Issue: "Nonce too high"
**Solution**: Reset your MetaMask account:
- Settings → Advanced → Reset Account

### Issue: "Contract verification failed"
**Solution**: 
- Wait 1-2 minutes after deployment
- Ensure you're using exact same constructor parameters
- Check Etherscan API key is valid

### Issue: "Cannot estimate gas"
**Solution**:
- Increase gas limit in hardhat.config.ts
- Check RPC URL is working: `curl $SEPOLIA_RPC_URL`

---

## Contract Addresses (After Deployment)

Once deployed, update this section with actual addresses:

```
Network: Sepolia Testnet
Chain ID: 11155111

BTCRelay:        0x...
WrappedBTC:      0x...
ProofVerifier:   0x...
BridgeContract:  0x...

Deployer:        0x...
Block Number:    ...
Deployed At:     2025-10-01T...
```

---

## Security Checklist

Before mainnet deployment:

- [ ] All contracts verified on Etherscan
- [ ] Security audit completed
- [ ] Testnet testing completed (min 100 transactions)
- [ ] Emergency pause mechanisms tested
- [ ] Role-based access control verified
- [ ] Reentrancy guards in place
- [ ] Integer overflow protection verified
- [ ] Gas optimization completed
- [ ] Documentation updated
- [ ] Monitoring and alerts configured

---

## Useful Commands

```bash
# Check contract size
npm run size

# Get gas report
npm run gas-report

# Clean artifacts
npm run clean

# Compile contracts
npm run compile

# Run specific test
npx hardhat test test/BridgeContract.test.ts

# Deploy to local hardhat network
npm run deploy:local
```

---

## Support

If you encounter issues:
1. Check the deployment logs
2. Review the troubleshooting section
3. Ensure all prerequisites are met
4. Check Sepolia testnet status: https://sepolia.etherscan.io/

---

**Last Updated**: October 2025  
**Status**: Ready for Deployment  
**Estimated Cost**: 0.01-0.03 Sepolia ETH
