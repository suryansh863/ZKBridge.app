# 🧪 Local Testing Guide - ZKBridge

## ✅ Contracts Deployed Successfully!

Your ZKBridge contracts are now deployed on **localhost** and ready for testing!

### 📋 Contract Addresses
- **BTCRelay**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **WrappedBTC**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **ProofVerifier**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **BridgeContract**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

## 🚀 How to Test

### 1. Connect MetaMask to Localhost

#### Add Localhost Network to MetaMask:
- **Network Name**: Localhost 8545
- **RPC URL**: http://localhost:8545
- **Chain ID**: 1337
- **Currency Symbol**: ETH

#### Import Test Account:
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Balance**: 10,000 ETH (test funds)

### 2. Test Your Application

1. **Open your app**: http://localhost:3000
2. **Connect MetaMask** to localhost network
3. **Switch to localhost** in MetaMask
4. **Test wallet connection** - should show connected with 10,000 ETH
5. **Test bridge functionality** - try interacting with contracts

### 3. Test Contract Functions

You can test these functions in your app:

#### WrappedBTC Contract:
- `name()` - Should return "ZK Bridge Bitcoin"
- `symbol()` - Should return "ZKBTC"
- `totalSupply()` - Should return 0 initially
- `balanceOf(address)` - Check balance

#### BridgeContract:
- `bridgeFeeBasisPoints()` - Should return 30
- `minBridgeAmount()` - Should return 1000 (0.00001 BTC)
- `maxBridgeAmount()` - Should return 100000000000000 (1000000 BTC)

#### BTCRelay:
- `genesisHash()` - Should return Bitcoin genesis hash
- `getLatestBlockHeight()` - Should return 0 initially

## 🔧 Development Commands

### Start Local Blockchain:
```bash
cd contracts
npx hardhat node
```

### Deploy Contracts:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Run Tests:
```bash
cd contracts
npx hardhat test
```

### Check Contract Status:
```bash
cd contracts
npx hardhat console --network localhost
```

## 🎯 Benefits of Local Testing

✅ **No API keys needed** - Works offline  
✅ **Instant transactions** - No waiting for confirmations  
✅ **Free test ETH** - 10,000 ETH available  
✅ **Full control** - Reset blockchain anytime  
✅ **Fast development** - Immediate feedback  
✅ **No costs** - Completely free  

## 🔄 Reset Blockchain

To reset the local blockchain:
1. Stop the Hardhat node (Ctrl+C)
2. Start it again: `npx hardhat node`
3. Redeploy contracts: `npx hardhat run scripts/deploy.ts --network localhost`

## 📱 Next Steps

1. **Test all functionality** on localhost
2. **Fix any issues** you find
3. **When ready for testnet**: Get Sepolia ETH and deploy to Sepolia
4. **For production**: Deploy to Ethereum mainnet

## 🆘 Troubleshooting

### MetaMask Not Connecting:
- Make sure you're on localhost network
- Check that Hardhat node is running
- Try refreshing the page

### Contracts Not Loading:
- Verify contract addresses are correct
- Check that contracts are deployed
- Look at browser console for errors

### Transaction Failing:
- Check you have enough ETH (should have 10,000)
- Verify you're on the correct network
- Check gas limits

---

**Happy Testing!** 🎉







