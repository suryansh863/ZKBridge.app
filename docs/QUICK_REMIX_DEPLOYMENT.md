# 🚀 Quick Remix Deployment Guide

## Your Contract Files Are Ready!
Located in: `/home/suryansh/Projects/ZKBridge.app/deployment-files/`

## Step-by-Step Remix Deployment

### 1. Open Remix IDE
Go to: https://remix.ethereum.org/

### 2. Create Workspace
- Click "Create New Workspace"
- Name: "ZKBridge"
- Template: "Blank"

### 3. Upload Contracts
In the file explorer, create these files and copy the content:

#### File: `contracts/BTCRelay.sol`
Copy from: `/home/suryansh/Projects/ZKBridge.app/deployment-files/BTCRelay.sol`

#### File: `contracts/WrappedBTC.sol`
Copy from: `/home/suryansh/Projects/ZKBridge.app/deployment-files/WrappedBTC.sol`

#### File: `contracts/ProofVerifier.sol`
Copy from: `/home/suryansh/Projects/ZKBridge.app/deployment-files/ProofVerifier.sol`

#### File: `contracts/BridgeContract.sol`
Copy from: `/home/suryansh/Projects/ZKBridge.app/deployment-files/BridgeContract.sol`

### 4. Compile
- Go to "Solidity Compiler" tab
- Version: `0.8.20`
- Click "Compile contracts"

### 5. Deploy to Sepolia

#### Connect MetaMask
- Environment: "Injected Provider - MetaMask"
- Make sure MetaMask is on Sepolia network

#### Deploy BTCRelay
- Contract: `BTCRelay`
- Constructor params:
  - `genesisHash`: `0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`
  - `genesisTimestamp`: `1231006505`

#### Deploy WrappedBTC
- Contract: `WrappedBTC`
- Constructor params:
  - `name`: `ZK Bridge Bitcoin`
  - `symbol`: `ZKBTC`
  - `admin`: `0x59e702a8b62b8f4B96a6369D5B46499eD6160D70`

#### Deploy ProofVerifier
- Contract: `ProofVerifier`
- Constructor params: None

#### Deploy BridgeContract
- Contract: `BridgeContract`
- Constructor params:
  - `btcRelay`: (address from BTCRelay)
  - `wrappedBTC`: (address from WrappedBTC)
  - `proofVerifier`: (address from ProofVerifier)

### 6. Configure Contracts
After deployment, call these functions:

#### In WrappedBTC contract:
- Function: `setBridgeContract`
- Parameter: BridgeContract address

## Your Deployment Address
`0x59e702a8b62b8f4B96a6369D5B46499eD6160D70`

## Check Balance
https://sepolia.etherscan.io/address/0x59e702a8b62b8f4B96a6369D5B46499eD6160D70

## Benefits of Remix
✅ No API key needed  
✅ Visual interface  
✅ Built-in MetaMask integration  
✅ Easy error handling  
✅ Contract verification built-in  

## Need Sepolia ETH?
Try these faucets:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://faucets.chain.link/sepolia
