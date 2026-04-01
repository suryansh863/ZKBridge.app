# 🚀 Deploy ZKBridge to Sepolia using Remix IDE

## Why Use Remix IDE?
- **No command line issues** - Avoids Hardhat dependency problems
- **Built-in wallet integration** - Works directly with MetaMask
- **Visual deployment** - Easy to see what's happening
- **Built-in verification** - Can verify contracts on Etherscan
- **Free to use** - No additional setup required

## Step-by-Step Deployment

### 1. Open Remix IDE
Go to: https://remix.ethereum.org/

### 2. Create New Workspace
- Click "Create New Workspace"
- Name: "ZKBridge"
- Template: "Blank"

### 3. Upload Contract Files
Create these files in Remix:

#### File 1: `contracts/BTCRelay.sol`
Copy the content from: `contracts/contracts/BTCRelay.sol`

#### File 2: `contracts/WrappedBTC.sol`  
Copy the content from: `contracts/contracts/WrappedBTC.sol`

#### File 3: `contracts/ProofVerifier.sol`
Copy the content from: `contracts/contracts/ProofVerifier.sol`

#### File 4: `contracts/BridgeContract.sol`
Copy the content from: `contracts/contracts/BridgeContract.sol`

### 4. Compile Contracts
- Go to "Solidity Compiler" tab
- Select version: `0.8.20`
- Click "Compile contracts"
- Ensure all contracts compile without errors

### 5. Connect MetaMask
- Go to "Deploy & Run Transactions" tab
- Environment: "Injected Provider - MetaMask"
- Make sure MetaMask is connected to Sepolia network

### 6. Deploy Contracts (In Order)

#### Deploy BTCRelay
- Contract: `BTCRelay`
- Constructor parameters:
  - `genesisHash`: `0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`
  - `genesisTimestamp`: `1231006505`
- Click "Deploy"

#### Deploy WrappedBTC
- Contract: `WrappedBTC`
- Constructor parameters:
  - `name`: `ZK Bridge Bitcoin`
  - `symbol`: `ZKBTC`
  - `admin`: `0x59e702a8b62b8f4B96a6369D5B46499eD6160D70` (your address)
- Click "Deploy"

#### Deploy ProofVerifier
- Contract: `ProofVerifier`
- Constructor parameters: None
- Click "Deploy"

#### Deploy BridgeContract
- Contract: `BridgeContract`
- Constructor parameters:
  - `btcRelay`: (address from BTCRelay deployment)
  - `wrappedBTC`: (address from WrappedBTC deployment)
  - `proofVerifier`: (address from ProofVerifier deployment)
- Click "Deploy"

### 7. Configure Contracts

After deployment, you need to configure the contracts:

#### Set Bridge Contract in WrappedBTC
- Find the deployed WrappedBTC contract
- Call `setBridgeContract` function
- Parameter: BridgeContract address

#### Grant Roles (Optional for testing)
Grant necessary roles to your address in each contract:
- `RELAYER_ROLE`
- `OPERATOR_ROLE`  
- `VERIFIER_ROLE`

### 8. Verify Contracts on Etherscan

For each deployed contract:
1. Copy the contract address
2. Go to Sepolia Etherscan: https://sepolia.etherscan.io/
3. Find your contract
4. Click "Verify and Publish"
5. Upload source code
6. Enter constructor arguments

## Benefits of Remix Deployment

✅ **No dependency issues** - Avoids Hardhat problems  
✅ **Visual interface** - Easy to see deployment status  
✅ **Built-in wallet** - Works with MetaMask directly  
✅ **Error handling** - Clear error messages  
✅ **Gas estimation** - Shows deployment costs  
✅ **Contract interaction** - Test functions after deployment  

## Alternative: Get Sepolia ETH First

If you prefer to use Hardhat, get Sepolia ETH from these faucets (no mainnet ETH required):

1. **Sepolia Faucet**: https://sepoliafaucet.com/
2. **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia
3. **Chainlink Faucet**: https://faucets.chain.link/sepolia

## Next Steps After Deployment

1. ✅ Deploy all contracts to Sepolia
2. ✅ Verify contracts on Etherscan
3. ✅ Update frontend configuration with contract addresses
4. ✅ Test bridge functionality
5. ✅ Deploy frontend to production

---

**Your deployment address**: `0x59e702a8b62b8f4B96a6369D5B46499eD6160D70`  
**Sepolia Etherscan**: https://sepolia.etherscan.io/







