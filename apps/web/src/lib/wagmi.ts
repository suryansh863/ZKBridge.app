import { configureChains, createConfig } from 'wagmi'
import { sepolia, goerli, hardhat } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { 
  getDefaultWallets, 
  connectorsForWallets,
} from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'

const { chains: wagmiChains, publicClient, webSocketPublicClient } = configureChains(
  [hardhat, sepolia, goerli] as any,
  [publicProvider()]
)

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'b19c0d68780c98ce580cc0b970e9aa4d'

const { wallets } = getDefaultWallets({
  appName: 'BridgeSpark',
  projectId,
  chains: wagmiChains as any,
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      injectedWallet({ chains: wagmiChains as any }),
    ],
  },
])

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { config, wagmiChains as chains }

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

