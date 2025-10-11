# 🚀 ZKBridge Sepolia Deployment Guide

## Prerequisites

### 1. Get Sepolia ETH
Your deployment wallet: `0x59e702a8b62b8f4B96a6369D5B46499eD6160D70`

**Faucets to get Sepolia ETH:**
- [Sepolia Faucet](https://sepoliafaucet.com/) - Primary option
- [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) - Backup option  
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia) - Alternative

**You need at least 0.01 ETH for deployment.**

### 2. Verify Balance
Check your balance at: https://sepolia.etherscan.io/address/0x59e702a8b62b8f4B96a6369D5B46499eD6160D70

## Deployment Methods

### Method 1: Remix IDE (Recommended)

1. **Open Remix IDE**: https://remix.ethereum.org/
2. **Create new workspace**: "ZKBridge"
3. **Upload contracts**: Copy contract files from `contracts/contracts/`
4. **Compile contracts**: Use Solidity 0.8.20
5. **Deploy to Sepolia**:
   - Connect MetaMask to Sepolia
   - Switch to Sepolia network
   - Deploy contracts in this order:
     1. BTCRelay
     2. WrappedBTC  
     3. ProofVerifier
     4. BridgeContract

### Method 2: Fix Hardhat Dependencies

```bash
cd contracts
rm -rf node_modules package-lock.json
npm install
npm install --save-dev ts-node@latest
npx hardhat run scripts/deploy.ts --network sepolia
```

### Method 3: Use Foundry (Alternative)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy with Foundry
forge build
forge create BTCRelay --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

## Contract Deployment Order

1. **BTCRelay**
   - Constructor: `genesisHash`, `genesisTimestamp`
   - Genesis Hash: `0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`
   - Genesis Timestamp: `1231006505`

2. **WrappedBTC**
   - Constructor: `name`, `symbol`, `admin`
   - Name: "ZK Bridge Bitcoin"
   - Symbol: "ZKBTC"
   - Admin: Your deployer address

3. **ProofVerifier**
   - Constructor: No parameters

4. **BridgeContract**
   - Constructor: `btcRelay`, `wrappedBTC`, `proofVerifier`
   - Use addresses from previous deployments

## Configuration After Deployment

### 1. Set Bridge Contract in WrappedBTC
```solidity
wrappedBTC.setBridgeContract(bridgeContractAddress)
```

### 2. Grant Roles
```solidity
// BTCRelay roles
btcRelay.grantRole(RELAYER_ROLE, yourAddress)
btcRelay.grantRole(OPERATOR_ROLE, yourAddress)

// BridgeContract roles  
bridgeContract.grantRole(OPERATOR_ROLE, yourAddress)
bridgeContract.grantRole(RELAYER_ROLE, yourAddress)

// ProofVerifier roles
proofVerifier.grantRole(VERIFIER_ROLE, yourAddress)
proofVerifier.grantRole(OPERATOR_ROLE, yourAddress)
```

## Frontend Configuration

After deployment, update these files:

### 1. Update Contract Addresses
File: `apps/web/src/lib/contracts.ts`
```typescript
export const SEPOLIA_CONTRACTS = {
  BTCRelay: "0x...",
  WrappedBTC: "0x...", 
  ProofVerifier: "0x...",
  BridgeContract: "0x..."
};
```

### 2. Update Network Configuration
File: `apps/web/src/lib/wagmi.ts`
```typescript
// Ensure Sepolia is the primary network
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia], // Make Sepolia primary
  [/* providers */]
);
```

## Verification

### 1. Verify Contracts on Etherscan
- Go to https://sepolia.etherscan.io/
- Verify each contract with source code
- Use constructor arguments from deployment

### 2. Test Basic Functions
```javascript
// Test WrappedBTC
const name = await wrappedBTC.name();
const symbol = await wrappedBTC.symbol();

// Test BridgeContract
const fee = await bridgeContract.bridgeFeeBasisPoints();
const minAmount = await bridgeContract.minBridgeAmount();
```

## Troubleshooting

### Common Issues:

1. **"Insufficient funds"**
   - Get more Sepolia ETH from faucets

2. **"Contract deployment failed"**
   - Check gas limit
   - Verify constructor parameters
   - Ensure network is Sepolia

3. **"Transaction reverted"**
   - Check contract dependencies
   - Verify all addresses are correct
   - Check contract permissions

### Support Resources:
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Remix IDE](https://remix.ethereum.org/)

## Next Steps After Deployment

1. ✅ Deploy smart contracts to Sepolia
2. ✅ Verify contracts on Etherscan  
3. ✅ Update frontend configuration
4. ✅ Test bridge functionality
5. ✅ Deploy frontend to Vercel/Netlify
6. ✅ Configure monitoring and alerts

---

**Deployment Wallet**: `0x59e702a8b62b8f4B96a6369D5B46499eD6160D70`  
**Network**: Sepolia Testnet (Chain ID: 11155111)  
**RPC URL**: `https://sepolia.infura.io/v3/z+XSQo3rhEwz6wIGyvZn0voj3EuvdFiWbJlyRimapjP5a00nWGsxwQ`