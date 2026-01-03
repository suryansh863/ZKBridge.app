/**
 * Wallet connection types and interfaces for BridgeSpark
 * Supports multiple wallet providers
 */

export type WalletType =
  | 'metamask'
  | 'coinbase'
  | 'trust'
  | 'walletconnect'
  | 'exodus'
  | 'phantom'
  | 'rainbow'
  | 'zerion'
  | 'binance'
  | 'okx'
  | 'bitget'
  | 'custom';

export type WalletCategory = 'browser' | 'mobile' | 'hardware';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type NetworkType = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'bsc' | 'bitcoin';

export interface WalletInfo {
  id: string;
  name: string;
  type: WalletType;
  category: WalletCategory;
  icon: string;
  description: string;
  supportedNetworks: NetworkType[];
  isInstalled?: boolean;
  downloadUrl?: string;
  deepLink?: string;
  guideUrl?: string;
}

export interface WalletConnection {
  walletId: string;
  address: string;
  chainId: number;
  network: NetworkType;
  status: ConnectionStatus;
  balance?: string;
  ensName?: string;
  avatar?: string;
  connectedAt: Date;
  lastUsed: Date;
}

export interface WalletError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface WalletState {
  connections: WalletConnection[];
  activeConnection?: WalletConnection;
  errors: WalletError[];
  isConnecting: boolean;
  supportedWallets: WalletInfo[];
}

export interface WalletProvider {
  id: string;
  name: string;
  type: WalletType;
  category: WalletCategory;
  connect: () => Promise<WalletConnection>;
  disconnect: () => Promise<void>;
  getBalance: (address: string) => Promise<string>;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;
}

export interface QRCodeData {
  uri: string;
  deepLink?: string;
  qrCode: string;
}

export interface WalletConnectSession {
  topic: string;
  peer: {
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
  namespaces: Record<string, any>;
  expiry: number;
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
}

export interface WalletEvent {
  type: 'connect' | 'disconnect' | 'accountChanged' | 'chainChanged' | 'error';
  data: any;
  timestamp: Date;
}

export interface WalletConfig {
  projectId: string;
  chains: NetworkInfo[];
  defaultChain: number;
  autoConnect: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface WalletHookReturn {
  // State
  connections: WalletConnection[];
  activeConnection: WalletConnection | null;
  isConnecting: boolean;
  errors: WalletError[];

  // Actions
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: (walletId: string) => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;

  // Utilities
  getWalletInfo: (walletId: string) => WalletInfo | undefined;
  getSupportedWallets: () => WalletInfo[];
  clearErrors: () => void;
  refreshBalances: () => Promise<void>;
}



export interface WalletGuide {
  walletId: string;
  title: string;
  steps: {
    title: string;
    description: string;
    image?: string;
    video?: string;
  }[];
  tips: string[];
  troubleshooting: {
    problem: string;
    solution: string;
  }[];
}


