/**
 * Wallet connection types and interfaces for BridgeSpark
 * Supports multiple wallet providers and exchange integrations
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
  | 'coindcx'
  | 'binance'
  | 'okx'
  | 'bitget'
  | 'kraken'
  | 'custom';

export type WalletCategory = 'browser' | 'mobile' | 'exchange' | 'hardware';

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

export interface CoinDCXCredentials {
  apiKey: string;
  apiSecret: string;
  userId?: string;
  isTestnet?: boolean;
}

export interface CoinDCXAccount {
  id: string;
  email: string;
  balances: CoinDCXBalance[];
  tradingEnabled: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
}

export interface CoinDCXBalance {
  currency: string;
  balance: string;
  available: string;
  locked: string;
  usdValue: number;
}

export interface ExchangeConnection {
  exchangeId: string;
  name: string;
  type: 'coindcx' | 'binance' | 'kraken';
  credentials: CoinDCXCredentials | Record<string, any>;
  account?: CoinDCXAccount;
  status: ConnectionStatus;
  connectedAt: Date;
}

export interface WalletError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface WalletState {
  connections: WalletConnection[];
  exchangeConnections: ExchangeConnection[];
  activeConnection?: WalletConnection;
  activeExchange?: ExchangeConnection;
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
  enableCoinDCX: boolean;
  enableExchangeConnections: boolean;
  autoConnect: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface WalletHookReturn {
  // State
  connections: WalletConnection[];
  activeConnection: WalletConnection | null;
  exchangeConnections: ExchangeConnection[];
  activeExchange: ExchangeConnection | null;
  isConnecting: boolean;
  errors: WalletError[];
  
  // Actions
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: (walletId: string) => Promise<void>;
  connectExchange: (exchangeId: string, credentials: any) => Promise<void>;
  disconnectExchange: (exchangeId: string) => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;
  
  // Utilities
  getWalletInfo: (walletId: string) => WalletInfo | undefined;
  getSupportedWallets: () => WalletInfo[];
  clearErrors: () => void;
  refreshBalances: () => Promise<void>;
}

export interface CoinDCXApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface CoinDCXOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: string;
  price?: string;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CoinDCXTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade';
  currency: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: Date;
}

export interface ExchangeApiConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
  timeout?: number;
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


