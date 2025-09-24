import { configureChains, createConfig } from 'wagmi'
import { mainnet, sepolia, goerli } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, goerli],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || 'your-infura-key' }),
    publicProvider(),
  ],
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
      },
    }),
  ],
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

