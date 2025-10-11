# 🧪 MetaMask Localhost Connection Test

## ✅ Connection Checklist

### 1. MetaMask Setup
- [ ] Added localhost network (Chain ID: 1337)
- [ ] Imported test account
- [ ] Shows 10,000 ETH balance
- [ ] Connected to localhost network

### 2. Test Account Details
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance: 10,000 ETH
Network: Localhost 8545
```

### 3. Contract Addresses (for reference)
```
BTCRelay: 0x5FbDB2315678afecb367f032d93F642f64180aa3
WrappedBTC: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ProofVerifier: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
BridgeContract: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

## 🔍 What to Test

### 1. Wallet Connection
- Go to http://localhost:3000
- Click "Connect Wallet"
- Should show connected with 10,000 ETH

### 2. Bridge Page
- Navigate to /bridge
- Should load without errors
- Check browser console for any issues

### 3. Contract Interaction
- Try interacting with bridge functions
- Check if transactions are processed
- Verify gas fees are minimal (local network)

## 🚨 Troubleshooting

### MetaMask Not Connecting
- Ensure you're on localhost network
- Check that Hardhat node is running
- Try refreshing the page
- Clear MetaMask cache if needed

### No ETH Balance
- Verify you imported the correct private key
- Check you're on localhost network
- Restart Hardhat node if needed

### Contract Errors
- Verify contract addresses in frontend
- Check browser console for errors
- Ensure contracts are deployed

### Network Issues
- Make sure Hardhat node is running on port 8545
- Check firewall settings
- Try restarting both Hardhat and browser

## 📱 Next Steps After Connection

1. ✅ Test wallet connection
2. ✅ Test bridge functionality  
3. ✅ Try sample transactions
4. ✅ Check contract interactions
5. ✅ Verify all features work

## 🔄 Reset if Needed

If something goes wrong:
```bash
# Stop Hardhat node (Ctrl+C)
# Restart Hardhat node
cd contracts
npx hardhat node

# Redeploy contracts (in another terminal)
cd contracts  
npx hardhat run scripts/deploy.ts --network localhost
```

---

**Happy Testing!** 🎉







