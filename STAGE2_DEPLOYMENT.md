# Stage 2: Smart Contract Deployment & Real Data Integration

## 🎯 Objective
Deploy smart contracts to Sepolia testnet and integrate real blockchain data throughout the application.

## ✅ Pre-Deployment Checklist

- [x] All lint tests passing
- [x] TypeScript errors resolved
- [x] Database schema migrated
- [x] Real Bitcoin testnet integration complete
- [x] API endpoints operational
- [ ] Sepolia ETH in deployer wallet
- [ ] Infura/Alchemy RPC URL configured
- [ ] Etherscan API key obtained

---

## 📋 Step-by-Step Deployment

### Step 1: Get Sepolia ETH

1. **Get a wallet with Sepolia ETH** (minimum 0.1 ETH recommended):
   - Visit: https://sepoliafaucet.com/
   - Visit: https://www.alchemy.com/faucets/ethereum-sepolia
   - Visit: https://sepolia-faucet.pk910.de/

2. **Export your private key from MetaMask**:
   - Click on your account
   - Go to Account Details
   - Click "Export Private Key"
   - Enter your password
   - **⚠️ KEEP THIS SECURE! NEVER COMMIT TO GIT!**

### Step 2: Configure RPC Provider

Choose one:

**Option A: Infura (Recommended)**
1. Visit https://infura.io/
2. Create free account
3. Create new project
4. Copy the Sepolia endpoint URL
5. It looks like: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

**Option B: Alchemy**
1. Visit https://alchemy.com/
2. Create free account
3. Create new app (select Sepolia)
4. Copy the HTTPS URL

**Option C: Public RPC (Free but slower)**
- Use: `https://rpc.sepolia.org`

### Step 3: Get Etherscan API Key

1. Visit https://etherscan.io/apis
2. Create free account
3. Generate API key
4. Save for contract verification

### Step 4: Configure Environment

```bash
cd /Users/yashswisingh/ZKBridge.app/contracts

# Create .env file
cat > .env << 'EOF'
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
PRIVATE_KEY="your_private_key_without_0x_prefix"
ETHERSCAN_API_KEY="your_etherscan_api_key"
TOKEN_NAME="BridgeSpark Bitcoin"
TOKEN_SYMBOL="BSBTC"
EOF

# Edit the file and replace with your actual values
nano .env
```

### Step 5: Install Contract Dependencies

```bash
cd /Users/yashswisingh/ZKBridge.app/contracts
npm install
```

### Step 6: Compile Contracts

```bash
npm run compile
```

Expected output:
```
✅ Compiled 4 Solidity files successfully
```

### Step 7: Run Contract Tests

```bash
npm test
```

This ensures contracts work correctly before deployment.

### Step 8: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

**This will:**
1. Deploy BTCRelay (Bitcoin block header verification)
2. Deploy WrappedBTC (ERC-20 token representing Bitcoin)
3. Deploy ProofVerifier (ZK proof verification)
4. Deploy BridgeContract (main bridge logic)
5. Configure all contracts with proper roles and permissions
6. Generate deployment artifacts

**Expected Duration**: 2-5 minutes  
**Expected Cost**: 0.01-0.03 Sepolia ETH

### Step 9: Verify Contracts on Etherscan

The deployment script will output verification commands. Run them:

```bash
# Copy-paste the verification commands from deployment output
npx hardhat verify --network sepolia 0x... "args..."
```

### Step 10: Update Application Configuration

The deployment script automatically creates `.env.contracts`. Merge it:

```bash
cd /Users/yashswisingh/ZKBridge.app
cat .env.contracts >> .env
```

Update frontend environment:

```bash
cd apps/web
cat > .env.local << EOF
NEXT_PUBLIC_BTC_RELAY_ADDRESS="0x..."
NEXT_PUBLIC_WRAPPED_BTC_ADDRESS="0x..."
NEXT_PUBLIC_PROOF_VERIFIER_ADDRESS="0x..."
NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_ETHEREUM_NETWORK="sepolia"
NEXT_PUBLIC_ETHEREUM_CHAIN_ID="11155111"
EOF
```

### Step 11: Restart Application

```bash
cd /Users/yashswisingh/ZKBridge.app
pkill -f "npm run dev"
npm run dev
```

---

## 🔧 Alternative: Local Development (No Deployment Needed)

If you want to test locally first:

```bash
# Terminal 1: Start local Hardhat node
cd contracts
npx hardhat node

# Terminal 2: Deploy to local network
npm run deploy:local

# Terminal 3: Run application
cd ..
npm run dev
```

---

## 📊 Post-Deployment Validation

### Check Contract Deployment

```bash
# Visit Sepolia Etherscan
https://sepolia.etherscan.io/address/YOUR_BRIDGE_CONTRACT_ADDRESS

# Check contract is verified (green checkmark)
# Read contract functions should be visible
```

### Test Contract Interaction

```bash
# Call a read function (no gas needed)
npx hardhat console --network sepolia

# In the console:
const BridgeContract = await ethers.getContractFactory("BridgeContract");
const bridge = BridgeContract.attach("YOUR_BRIDGE_CONTRACT_ADDRESS");
const fee = await bridge.bridgeFeeBasisPoints();
console.log("Bridge fee:", fee.toString());
```

---

## 🚨 Troubleshooting

### Problem: "Insufficient funds for gas"
**Solution**: 
- Get more Sepolia ETH from faucets
- Current balance must be > 0.05 ETH

### Problem: "Nonce too high"
**Solution**:
- MetaMask → Settings → Advanced → Reset Account
- Try deployment again

### Problem: "Cannot estimate gas"
**Solution**:
- Check RPC URL is working: `curl $SEPOLIA_RPC_URL -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`
- Try different RPC provider

### Problem: "Contract verification failed"
**Solution**:
- Wait 2-3 minutes after deployment
- Ensure constructor parameters match exactly
- Check Etherscan API key is valid

### Problem: "Transaction reverted"
**Solution**:
- Check contract constructor parameters
- Review contract code for require statements
- Check deployer has necessary permissions

---

## 📈 What Gets Deployed

### 1. BTCRelay Contract
- **Purpose**: Verifies Bitcoin block headers
- **Size**: ~15 KB
- **Gas**: ~2-3M gas
- **Key Functions**: 
  - `submitBlockHeader()` - Add Bitcoin blocks
  - `verifyTransaction()` - Verify Bitcoin transactions

### 2. WrappedBTC Contract  
- **Purpose**: ERC-20 token representing Bitcoin
- **Size**: ~8 KB
- **Gas**: ~1.5M gas
- **Key Functions**:
  - `mint()` - Create wrapped Bitcoin
  - `burn()` - Unwrap to Bitcoin
  - Standard ERC-20 functions

### 3. ProofVerifier Contract
- **Purpose**: Verify Zero-Knowledge proofs
- **Size**: ~20 KB
- **Gas**: ~3-4M gas
- **Key Functions**:
  - `verifyProof()` - Verify ZK SNARK proofs
  - `registerVerificationKey()` - Add verification keys

### 4. BridgeContract Contract
- **Purpose**: Main bridge logic and orchestration
- **Size**: ~25 KB
- **Gas**: ~4-5M gas
- **Key Functions**:
  - `bridgeBitcoinToEthereum()` - Complete bridge flow
  - `claimWrappedBTC()` - Claim wrapped tokens
  - `burnWrappedBTC()` - Initiate reverse bridge

**Total Deployment Cost**: 0.01-0.03 Sepolia ETH (10-15M gas total)

---

## 🔐 Security Considerations

### Roles & Permissions

Each contract uses OpenZeppelin's AccessControl:

- **ADMIN_ROLE**: Can pause contracts, update parameters
- **OPERATOR_ROLE**: Can manage daily operations
- **RELAYER_ROLE**: Can submit block headers
- **VERIFIER_ROLE**: Can verify proofs

### Security Features

- ✅ **ReentrancyGuard**: Protection against reentrancy attacks
- ✅ **Pausable**: Emergency stop functionality
- ✅ **AccessControl**: Role-based permissions
- ✅ **SafeMath**: Overflow protection (built into Solidity 0.8+)
- ✅ **Input Validation**: All inputs validated
- ✅ **Event Logging**: Complete audit trail

---

## 📝 Post-Deployment Tasks

### Immediate (Required)
- [ ] Verify all contracts on Etherscan
- [ ] Test basic contract interactions
- [ ] Update frontend configuration
- [ ] Test end-to-end bridge flow
- [ ] Document contract addresses

### Short Term (1-2 days)
- [ ] Set up contract monitoring
- [ ] Configure alerting for unusual activity
- [ ] Test with real Bitcoin testnet transactions
- [ ] Load test with multiple transactions
- [ ] Complete security review

### Medium Term (1 week)
- [ ] External security audit
- [ ] Gas optimization
- [ ] Documentation update
- [ ] User testing
- [ ] Bug bounty program

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ All 4 contracts deployed without errors  
✅ All contracts verified on Etherscan (green checkmark)  
✅ Contract roles configured correctly  
✅ Frontend can read contract state  
✅ Test transaction completes successfully  
✅ No security vulnerabilities found  

---

## 📞 Support

Need help? Check:
1. [Hardhat Documentation](https://hardhat.org/docs)
2. [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
3. [Sepolia Faucets](https://sepoliafaucet.com/)
4. Contract deployment logs in `contracts/deployments/`

---

**Ready to deploy?** Run: `cd contracts && npm run deploy:sepolia`
