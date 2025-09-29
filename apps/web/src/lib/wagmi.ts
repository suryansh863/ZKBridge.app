import { configureChains, createConfig } from 'wagmi'
import { mainnet, sepolia, goerli } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, goerli],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || '9aa3d95b3bc440fa88ea12eaa4456161' }),
    publicProvider(),
  ],
)

// Create connectors array with error handling
const createConnectors = () => {
  console.log('🔧 Creating wagmi connectors...');
  
  const connectors: any[] = [
    new MetaMaskConnector({ 
      chains,
      options: {
        shimDisconnect: true,
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'BridgeSpark',
        appLogoUrl: 'https://bridgespark.app/logo.png',
      },
    }),
  ];

  // Only add WalletConnect if we have a valid project ID
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'b19c0d68780c98ce580cc0b970e9aa4d';
  
  if (walletConnectProjectId && walletConnectProjectId !== 'your-project-id' && walletConnectProjectId.length > 20) {
    try {
      const walletConnectConnector = new WalletConnectConnector({
        chains,
        options: {
          projectId: walletConnectProjectId,
          metadata: {
            name: 'BridgeSpark',
            description: 'Bitcoin-Ethereum trustless bridge with ZK proofs',
            url: 'https://bridgespark.app',
            icons: ['https://bridgespark.app/logo.png'],
          },
          showQrModal: true,
        },
      });
      connectors.push(walletConnectConnector);
      console.log('✅ WalletConnect connector added');
    } catch (error) {
      console.warn('❌ Failed to initialize WalletConnect connector:', error);
    }
  } else {
    console.log('⚠️ WalletConnect disabled - no valid project ID provided');
  }

  // Add specific injected connectors for different wallets
  const exodusConnector = new InjectedConnector({
    chains,
    options: {
      name: 'Exodus',
      shimDisconnect: true,
    },
  });
  connectors.push(exodusConnector);
  
  console.log('📋 Final connectors:', connectors.map((c, i) => ({ 
    index: i, 
    id: c.id, 
    name: c.name, 
    type: c.type 
  })));

  return connectors;
};

export const config = createConfig({
  autoConnect: true,
  connectors: createConnectors(),
  publicClient,
  webSocketPublicClient,
})

// Export chains for RainbowKit
export { chains }

// Custom chain configurations
export const bitcoinTestnet = {
  id: 18332,
  name: 'Bitcoin Testnet',
  network: 'bitcoin-testnet',
  nativeCurrency: {
    decimals: 8,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:18332'],
    },
    public: {
      http: ['http://localhost:18332'],
    },
  },
  blockExplorers: {
    default: { name: 'Blockstream', url: 'https://blockstream.info/testnet' },
  },
  testnet: true,
} as const

// Wallet connection states
export const WALLET_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
} as const

export type WalletState = typeof WALLET_STATES[keyof typeof WALLET_STATES]

// Wallet info interface
export interface WalletInfo {
  address: string
  chainId: number
  balance: string
  isConnected: boolean
  ensName?: string
}

