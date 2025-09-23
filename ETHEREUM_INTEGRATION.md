# Ethereum Smart Contract Integration

## 🎯 **Overview**

This document explains the comprehensive Ethereum smart contract integration for ZKBridge, covering wallet connection, smart contract interactions, gas estimation, event listening, and balance management.

## 🔧 **Integration Points**

### **1. Wallet Connection (MetaMask)**
- **Wagmi Integration**: Uses `wagmi` for wallet connection management
- **Multiple Wallets**: Supports MetaMask, WalletConnect, and injected wallets
- **Auto-Connect**: Automatically reconnects to previously connected wallets
- **Chain Support**: Ethereum Mainnet, Sepolia, and Goerli testnets

### **2. Smart Contract Deployment and Calls**
- **Bridge Contract**: Main contract for Bitcoin-Ethereum bridging
- **Wrapped BTC**: ERC-20 token representing Bitcoin on Ethereum
- **BTC Relay**: Contract for Bitcoin transaction verification
- **Gas Optimization**: Efficient gas usage with proper estimation

### **3. Gas Estimation and Transaction Submission**
- **Real-time Gas Estimation**: Estimates gas before transaction submission
- **Gas Price Optimization**: Uses current network gas prices
- **Transaction Batching**: Optimizes multiple operations
- **Error Handling**: Comprehensive error handling for failed transactions

### **4. Event Listening for Bridge Completions**
- **Real-time Events**: Listens for `BridgeInitiated` and `BridgeCompleted` events
- **Event Filtering**: Filters events by user address
- **Automatic Updates**: Updates UI when new events are detected
- **Historical Data**: Fetches past bridge transactions

### **5. Balance Checking for Wrapped Tokens**
- **ETH Balance**: Native Ethereum balance
- **Wrapped BTC Balance**: ERC-20 wrapped Bitcoin balance
- **Allowance Management**: Tracks and manages token allowances
- **Real-time Updates**: Balances update automatically

## 📁 **File Structure**

```
frontend/src/
├── hooks/
│   └── useEthereum.ts              # Main Ethereum integration hook
├── lib/
│   ├── contracts.ts                # Contract addresses and types
│   └── logger.ts                   # Logging utility
└── components/
    └── ethereum-bridge-interface.tsx # UI component using the hook
```

## 🚀 **Usage Examples**

### **Basic Hook Usage**

```typescript
import { useEthereum } from '@/hooks/useEthereum';

function MyComponent() {
  const {
    isConnected,
    address,
    ethBalance,
    wrappedBTCBalance,
    bridgeTransactions,
    claimBitcoinOnEthereum,
    burnWrappedBTCForBitcoin,
    isLoading,
    error
  } = useEthereum();

  // Use the hook data and functions
}
```

### **Claim Bitcoin on Ethereum**

```typescript
const handleClaimBitcoin = async () => {
  try {
    await claimBitcoinOnEthereum(
      '0x1234...', // Bitcoin transaction hash
      '0xabcd...', // Merkle proof
      'bc1q...',   // Bitcoin address
      '0.001'      // Amount in BTC
    );
  } catch (error) {
    console.error('Claim failed:', error);
  }
};
```

### **Burn Wrapped BTC for Bitcoin**

```typescript
const handleBurnWBTC = async () => {
  try {
    await burnWrappedBTCForBitcoin('0.001'); // Amount in WBTC
  } catch (error) {
    console.error('Burn failed:', error);
  }
};
```

### **Gas Estimation**

```typescript
const estimateGas = async () => {
  try {
    const gasEstimate = await estimateGas('burnWrappedBTC', ['100000000']); // 1 BTC in satoshis
    console.log('Gas estimate:', gasEstimate);
  } catch (error) {
    console.error('Gas estimation failed:', error);
  }
};
```

## 🔗 **Smart Contract Integration**

### **Bridge Contract Functions**

```solidity
// Claim Bitcoin on Ethereum
function claimBitcoin(
    bytes32 btcTxHash,
    bytes merkleProof,
    string calldata btcAddress,
    uint256 amount
) external nonReentrant;

// Burn wrapped BTC to initiate Bitcoin withdrawal
function burnWrappedBTC(uint256 amount) external nonReentrant;

// Get bridge status
function getBridgeStatus(bytes32 bridgeId) external view returns (
    uint8 status,
    uint256 amount,
    uint256 fee,
    uint256 timestamp
);
```

### **Events**

```solidity
event BridgeInitiated(
    bytes32 indexed bridgeId,
    address indexed user,
    uint256 indexed amount,
    bytes32 btcTxHash,
    string btcAddress,
    uint256 timestamp
);

event BridgeCompleted(
    bytes32 indexed bridgeId,
    address indexed user,
    uint256 indexed amount,
    uint256 fee,
    uint256 timestamp
);
```

## ⚙️ **Configuration**

### **Environment Variables**

```env
# Contract Addresses
NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_WRAPPED_BTC_ADDRESS=0x...
NEXT_PUBLIC_BTC_RELAY_ADDRESS=0x...

# Wallet Configuration
NEXT_PUBLIC_INFURA_API_KEY=your-infura-key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

### **Wagmi Configuration**

```typescript
// lib/wagmi.ts
import { configureChains, createConfig } from 'wagmi'
import { mainnet, sepolia, goerli } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

const { chains, publicClient } = configureChains(
  [mainnet, sepolia, goerli],
  [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY })]
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    // ... other connectors
  ],
  publicClient,
})
```

## 🔄 **Transaction Flow**

### **Bitcoin to Ethereum (Claim)**

1. **User provides Bitcoin transaction hash and Merkle proof**
2. **Hook estimates gas for claim transaction**
3. **User approves transaction in wallet**
4. **Smart contract verifies Merkle proof**
5. **Wrapped BTC is minted to user's address**
6. **Event is emitted for UI updates**

### **Ethereum to Bitcoin (Burn)**

1. **User specifies amount to burn**
2. **Hook checks allowance and approves if needed**
3. **Gas is estimated for burn transaction**
4. **User approves transaction in wallet**
5. **Wrapped BTC is burned**
6. **Bitcoin withdrawal is initiated**
7. **Event is emitted for UI updates**

## 🛡️ **Security Features**

### **Input Validation**
- **Address Validation**: Validates Ethereum and Bitcoin addresses
- **Amount Validation**: Ensures amounts are within limits
- **Proof Verification**: Validates Merkle proofs before submission

### **Error Handling**
- **Transaction Failures**: Comprehensive error handling
- **Network Issues**: Retry logic for network failures
- **User Feedback**: Clear error messages for users

### **Gas Optimization**
- **Gas Estimation**: Accurate gas estimation before transactions
- **Gas Price Optimization**: Uses optimal gas prices
- **Batch Operations**: Combines multiple operations when possible

## 📊 **State Management**

### **Hook State**
```typescript
interface EthereumHookState {
  // Connection
  isConnected: boolean;
  address: string | undefined;
  
  // Balances
  ethBalance: string;
  wrappedBTCBalance: string;
  allowance: string;
  
  // Transactions
  bridgeTransactions: BridgeTransaction[];
  
  // Gas
  gasEstimate: GasEstimate | null;
  
  // Loading States
  isLoading: boolean;
  isClaiming: boolean;
  isBurning: boolean;
  isApproving: boolean;
  
  // Error Handling
  error: string | null;
}
```

### **Automatic Updates**
- **Balance Updates**: Balances update automatically after transactions
- **Transaction History**: New transactions appear automatically
- **Event Listening**: Real-time event listening for new bridge events
- **Error Clearing**: Errors are cleared when new operations start

## 🧪 **Testing**

### **Unit Tests**
```typescript
// Test the hook functionality
import { renderHook } from '@testing-library/react';
import { useEthereum } from '@/hooks/useEthereum';

test('should connect wallet', async () => {
  const { result } = renderHook(() => useEthereum());
  // Test wallet connection
});
```

### **Integration Tests**
```typescript
// Test smart contract interactions
test('should claim Bitcoin', async () => {
  const { result } = renderHook(() => useEthereum());
  await result.current.claimBitcoinOnEthereum(
    '0x1234...',
    '0xabcd...',
    'bc1q...',
    '0.001'
  );
  // Verify transaction was submitted
});
```

## 🚀 **Deployment**

### **Contract Deployment**
1. **Deploy Bridge Contract**
2. **Deploy Wrapped BTC Token**
3. **Deploy BTC Relay**
4. **Update Environment Variables**
5. **Verify Contracts on Etherscan**

### **Frontend Deployment**
1. **Build with contract addresses**
2. **Deploy to Vercel/Netlify**
3. **Configure environment variables**
4. **Test on testnet first**

## 📈 **Performance Optimization**

### **Gas Optimization**
- **Batch Operations**: Combine multiple operations
- **Gas Estimation**: Accurate gas estimation
- **Gas Price Optimization**: Use optimal gas prices

### **UI Optimization**
- **Lazy Loading**: Load components only when needed
- **Real-time Updates**: Efficient event listening
- **Error Handling**: Graceful error handling

### **Network Optimization**
- **Connection Pooling**: Efficient RPC connections
- **Caching**: Cache contract data when possible
- **Retry Logic**: Retry failed operations

## 🔍 **Debugging**

### **Logging**
```typescript
// Enable debug logging
logger.debug('Transaction submitted', { hash: txHash });
logger.info('Bridge completed', { bridgeId, amount });
logger.error('Transaction failed', error);
```

### **Common Issues**
1. **Wallet Not Connected**: Check wallet connection
2. **Insufficient Balance**: Check ETH and WBTC balances
3. **Gas Estimation Failed**: Check network connection
4. **Transaction Failed**: Check gas limits and network status

## 📚 **Resources**

- **Wagmi Documentation**: https://wagmi.sh/
- **Ethers.js Documentation**: https://docs.ethers.io/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **Ethereum Development**: https://ethereum.org/developers/

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch**
3. **Add tests for new functionality**
4. **Submit a pull request**

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

