import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet, goerli } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'ZKBridge',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, sepolia, goerli],
  ssr: true,
})

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

