/**
 * Wallet Service for BridgeSpark
 * Manages wallet connections, state, and provider integrations
 */

import { 
  WalletInfo, 
  WalletConnection, 
  WalletState, 
  WalletError, 
  WalletType, 
  WalletCategory,
  NetworkType,
  ConnectionStatus,
  CoinDCXCredentials,
  ExchangeConnection,
  CoinDCXAccount,
  CoinDCXBalance,
  CoinDCXApiResponse
} from '@/types/wallet';

class WalletService {
  private state: WalletState = {
    connections: [],
    exchangeConnections: [],
    errors: [],
    isConnecting: false,
    supportedWallets: []
  };

  private listeners: Set<(state: WalletState) => void> = new Set();
  private coinDCXApiUrl = 'https://api.coindcx.com';

  constructor() {
    // Initialize supported wallets first
    this.state.supportedWallets = this.getSupportedWalletConfigs();
    
    // Only initialize service in browser environment
    if (typeof window !== 'undefined') {
      this.initializeService();
    }
  }

  /**
   * Initialize the wallet service
   */
  private initializeService(): void {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    // Load persisted connections from localStorage
    this.loadPersistedConnections();
    
    // Set up event listeners for wallet events
    this.setupEventListeners();
    
    // Auto-connect if enabled
    if (this.shouldAutoConnect()) {
      this.autoConnect();
    }
  }

  /**
   * Get supported wallet information
   */
  private getSupportedWalletConfigs(): WalletInfo[] {
    // Always return wallets, even if not installed
    return [
      {
        id: 'metamask',
        name: 'MetaMask',
        type: 'metamask',
        category: 'browser',
        icon: '/icons/wallets/metamask.svg',
        description: 'The most popular Ethereum wallet',
        supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
        isInstalled: typeof window !== 'undefined' ? this.isWalletInstalled('metamask') : false,
        downloadUrl: 'https://metamask.io/download/',
        guideUrl: '/guides/metamask'
      },
      {
        id: 'binance',
        name: 'Binance Web3 Wallet',
        type: 'binance',
        category: 'browser',
        icon: '/icons/wallets/binance.svg',
        description: 'Binance\'s official Web3 wallet',
        supportedNetworks: ['ethereum', 'bsc', 'polygon', 'arbitrum'],
        isInstalled: typeof window !== 'undefined' ? this.isWalletInstalled('binance') : false,
        downloadUrl: 'https://www.binance.com/en/web3-wallet',
        guideUrl: '/guides/binance'
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        type: 'trust',
        category: 'mobile',
        icon: '/icons/wallets/trust.svg',
        description: 'Secure multi-chain wallet',
        supportedNetworks: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism'],
        isInstalled: typeof window !== 'undefined' ? this.isWalletInstalled('trust') : false,
        downloadUrl: 'https://trustwallet.com/download',
        guideUrl: '/guides/trust'
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        type: 'okx',
        category: 'browser',
        icon: '/icons/wallets/okx.svg',
        description: 'Multi-chain Web3 wallet by OKX',
        supportedNetworks: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'],
        isInstalled: typeof window !== 'undefined' ? this.isWalletInstalled('okx') : false,
        downloadUrl: 'https://www.okx.com/web3',
        guideUrl: '/guides/okx'
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        type: 'coinbase',
        category: 'browser',
        icon: '/icons/wallets/coinbase.svg',
        description: 'Coinbase\'s self-custody wallet',
        supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
        isInstalled: typeof window !== 'undefined' ? this.isWalletInstalled('coinbase') : false,
        downloadUrl: 'https://www.coinbase.com/wallet',
        guideUrl: '/guides/coinbase'
      },
      {
        id: 'bitget',
        name: 'Bitget Wallet',
        type: 'bitget',
        category: 'browser',
        icon: '/icons/wallets/bitget.svg',
        description: 'Multi-chain wallet by Bitget',
        supportedNetworks: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism'],
        isInstalled: typeof window !== 'undefined' ? this.isWalletInstalled('bitget') : false,
        downloadUrl: 'https://web3.bitget.com/',
        guideUrl: '/guides/bitget'
      }
    ];
  }

  /**
   * Check if a wallet is installed
   */
  private isWalletInstalled(walletType: WalletType): boolean {
    if (typeof window === 'undefined') return false;

    switch (walletType) {
      case 'metamask':
        return !!(window as any).ethereum?.isMetaMask;
      case 'coinbase':
        return !!(window as any).ethereum?.isCoinbaseWallet;
      case 'trust':
        return !!(window as any).ethereum?.isTrust;
      case 'exodus':
        return !!(window as any).ethereum?.isExodus;
      case 'okx':
        return !!(window as any).okxwallet?.ethereum;
      case 'bitget':
        return !!(window as any).bitkeep?.ethereum;
      case 'binance':
        return !!(window as any).BinanceChain;
      default:
        return false;
    }
  }

  /**
   * Connect to a wallet
   */
  async connectWallet(walletId: string): Promise<void> {
    try {
      this.setState({ isConnecting: true });
      this.clearErrors();

      const walletInfo = this.getWalletInfo(walletId);
      if (!walletInfo) {
        throw new Error(`Wallet ${walletId} not supported`);
      }

      let connection: WalletConnection;

      switch (walletInfo.type) {
        case 'metamask':
          connection = await this.connectMetaMask();
          break;
        case 'coinbase':
          connection = await this.connectCoinbase();
          break;
        case 'trust':
          connection = await this.connectTrust();
          break;
        case 'walletconnect':
          connection = await this.connectWalletConnect();
          break;
        case 'exodus':
          connection = await this.connectExodus();
          break;
        case 'okx':
          connection = await this.connectOKX();
          break;
        case 'bitget':
          connection = await this.connectBitget();
          break;
        case 'binance':
          connection = await this.connectBinance();
          break;
        default:
          throw new Error(`Connection method for ${walletInfo.type} not implemented`);
      }

      // Add connection to state
      const updatedConnections = [...this.state.connections, connection];
      this.setState({ 
        connections: updatedConnections,
        activeConnection: connection,
        isConnecting: false
      });

      // Persist connection
      this.persistConnections();

      // Emit connection event
      this.emitEvent('connect', connection);

    } catch (error) {
      this.handleError(error as Error, 'connectWallet');
      this.setState({ isConnecting: false });
    }
  }

  /**
   * Connect to MetaMask
   */
  private async connectMetaMask(): Promise<WalletConnection> {
    if (!(window as any).ethereum?.isMetaMask) {
      throw new Error('MetaMask not installed');
    }

    const ethereum = (window as any).ethereum;
    
    try {
      // Request account access with error handling
      const accounts = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      const chainId = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_chainId' 
      });
      const balance = await this.getBalance(accounts[0]);

      return {
        walletId: 'metamask',
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        network: this.getNetworkFromChainId(parseInt(chainId, 16)),
        status: 'connected',
        balance,
        connectedAt: new Date(),
        lastUsed: new Date()
      };
    } catch (error) {
      this.handleWalletError(error, 'MetaMask');
      throw error;
    }
  }

  /**
   * Connect to Coinbase Wallet
   */
  private async connectCoinbase(): Promise<WalletConnection> {
    if (!(window as any).ethereum?.isCoinbaseWallet) {
      throw new Error('Coinbase Wallet not installed');
    }

    const ethereum = (window as any).ethereum;
    
    try {
      const accounts = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      const chainId = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_chainId' 
      });
      const balance = await this.getBalance(accounts[0]);

      return {
        walletId: 'coinbase',
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        network: this.getNetworkFromChainId(parseInt(chainId, 16)),
        status: 'connected',
        balance,
        connectedAt: new Date(),
        lastUsed: new Date()
      };
    } catch (error) {
      this.handleWalletError(error, 'Coinbase Wallet');
      throw error;
    }
  }

  /**
   * Connect to Trust Wallet
   */
  private async connectTrust(): Promise<WalletConnection> {
    if (!(window as any).ethereum?.isTrust) {
      throw new Error('Trust Wallet not installed');
    }

    const ethereum = (window as any).ethereum;
    
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts.length) {
      throw new Error('No accounts found');
    }

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const balance = await this.getBalance(accounts[0]);

    return {
      walletId: 'trust',
      address: accounts[0],
      chainId: parseInt(chainId, 16),
      network: this.getNetworkFromChainId(parseInt(chainId, 16)),
      status: 'connected',
      balance,
      connectedAt: new Date(),
      lastUsed: new Date()
    };
  }

  /**
   * Connect via WalletConnect
   */
  private async connectWalletConnect(): Promise<WalletConnection> {
    // This would integrate with WalletConnect v2
    // For now, return a mock connection
    throw new Error('WalletConnect integration coming soon');
  }

  /**
   * Connect to Exodus
   */
  private async connectExodus(): Promise<WalletConnection> {
    if (!(window as any).ethereum?.isExodus) {
      throw new Error('Exodus not installed');
    }

    const ethereum = (window as any).ethereum;
    
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts.length) {
      throw new Error('No accounts found');
    }

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const balance = await this.getBalance(accounts[0]);

    return {
      walletId: 'exodus',
      address: accounts[0],
      chainId: parseInt(chainId, 16),
      network: this.getNetworkFromChainId(parseInt(chainId, 16)),
      status: 'connected',
      balance,
      connectedAt: new Date(),
      lastUsed: new Date()
    };
  }

  /**
   * Connect to OKX Wallet
   */
  private async connectOKX(): Promise<WalletConnection> {
    if (!(window as any).okxwallet?.ethereum) {
      throw new Error('OKX Wallet not installed');
    }

    const ethereum = (window as any).okxwallet.ethereum;
    
    try {
      const accounts = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      const chainId = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_chainId' 
      });
      const balance = await this.getBalance(accounts[0]);

      return {
        walletId: 'okx',
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        network: this.getNetworkFromChainId(parseInt(chainId, 16)),
        status: 'connected',
        balance,
        connectedAt: new Date(),
        lastUsed: new Date()
      };
    } catch (error) {
      this.handleWalletError(error, 'OKX Wallet');
      throw error;
    }
  }

  /**
   * Connect to Bitget Wallet
   */
  private async connectBitget(): Promise<WalletConnection> {
    if (!(window as any).bitkeep?.ethereum) {
      throw new Error('Bitget Wallet not installed');
    }

    const ethereum = (window as any).bitkeep.ethereum;
    
    try {
      const accounts = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      const chainId = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_chainId' 
      });
      const balance = await this.getBalance(accounts[0]);

      return {
        walletId: 'bitget',
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        network: this.getNetworkFromChainId(parseInt(chainId, 16)),
        status: 'connected',
        balance,
        connectedAt: new Date(),
        lastUsed: new Date()
      };
    } catch (error) {
      this.handleWalletError(error, 'Bitget Wallet');
      throw error;
    }
  }

  /**
   * Connect to Binance Web3 Wallet
   */
  private async connectBinance(): Promise<WalletConnection> {
    if (!(window as any).BinanceChain) {
      throw new Error('Binance Web3 Wallet not installed');
    }

    const ethereum = (window as any).BinanceChain;
    
    try {
      const accounts = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      const chainId = await this.safeEthereumRequest(ethereum, { 
        method: 'eth_chainId' 
      });
      const balance = await this.getBalance(accounts[0]);

      return {
        walletId: 'binance',
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        network: this.getNetworkFromChainId(parseInt(chainId, 16)),
        status: 'connected',
        balance,
        connectedAt: new Date(),
        lastUsed: new Date()
      };
    } catch (error) {
      this.handleWalletError(error, 'Binance Web3 Wallet');
      throw error;
    }
  }

  /**
   * Connect to CoinDCX exchange
   */
  async connectCoinDCX(credentials: CoinDCXCredentials): Promise<void> {
    try {
      this.setState({ isConnecting: true });
      this.clearErrors();

      // Validate credentials
      if (!credentials.apiKey || !credentials.apiSecret) {
        throw new Error('API Key and Secret are required');
      }

      // Test API connection
      const account = await this.testCoinDCXConnection(credentials);
      
      const exchangeConnection: ExchangeConnection = {
        exchangeId: 'coindcx',
        name: 'CoinDCX',
        type: 'coindcx',
        credentials,
        account,
        status: 'connected',
        connectedAt: new Date()
      };

      const updatedConnections = [...this.state.exchangeConnections, exchangeConnection];
      this.setState({ 
        exchangeConnections: updatedConnections,
        activeExchange: exchangeConnection,
        isConnecting: false
      });

      // Persist connection
      this.persistConnections();

    } catch (error) {
      this.handleError(error as Error, 'connectCoinDCX');
      this.setState({ isConnecting: false });
    }
  }

  /**
   * Test CoinDCX API connection
   */
  private async testCoinDCXConnection(credentials: CoinDCXCredentials): Promise<CoinDCXAccount> {
    try {
      // This would make actual API calls to CoinDCX
      // For now, return mock data
      const mockAccount: CoinDCXAccount = {
        id: 'mock-user-id',
        email: 'user@example.com',
        balances: [
          {
            currency: 'BTC',
            balance: '0.5',
            available: '0.5',
            locked: '0',
            usdValue: 15000
          },
          {
            currency: 'ETH',
            balance: '2.0',
            available: '2.0',
            locked: '0',
            usdValue: 4000
          }
        ],
        tradingEnabled: true,
        kycStatus: 'approved'
      };

      return mockAccount;
    } catch (error) {
      throw new Error(`Failed to connect to CoinDCX: ${error}`);
    }
  }

  /**
   * Disconnect a wallet
   */
  async disconnectWallet(walletId: string): Promise<void> {
    try {
      const updatedConnections = this.state.connections.filter(
        conn => conn.walletId !== walletId
      );

      this.setState({ 
        connections: updatedConnections,
        activeConnection: updatedConnections.length > 0 ? updatedConnections[0] : undefined
      });

      this.persistConnections();
      this.emitEvent('disconnect', { walletId });

    } catch (error) {
      this.handleError(error as Error, 'disconnectWallet');
    }
  }

  /**
   * Disconnect an exchange
   */
  async disconnectExchange(exchangeId: string): Promise<void> {
    try {
      const updatedConnections = this.state.exchangeConnections.filter(
        conn => conn.exchangeId !== exchangeId
      );

      this.setState({ 
        exchangeConnections: updatedConnections,
        activeExchange: updatedConnections.length > 0 ? updatedConnections[0] : undefined
      });

      this.persistConnections();

    } catch (error) {
      this.handleError(error as Error, 'disconnectExchange');
    }
  }

  /**
   * Get wallet balance
   */
  private async getBalance(address: string): Promise<string> {
    try {
      if (!(window as any).ethereum) {
        return '0';
      }

      const ethereum = (window as any).ethereum;
      const balance = await this.safeEthereumRequest(ethereum, {
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      // Convert from wei to ETH
      return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  /**
   * Get network from chain ID
   */
  private getNetworkFromChainId(chainId: number): NetworkType {
    switch (chainId) {
      case 1: return 'ethereum';
      case 137: return 'polygon';
      case 42161: return 'arbitrum';
      case 10: return 'optimism';
      case 8453: return 'base';
      case 56: return 'bsc';
      default: return 'ethereum';
    }
  }

  /**
   * Get wallet info by ID
   */
  getWalletInfo(walletId: string): WalletInfo | undefined {
    return this.state.supportedWallets?.find(wallet => wallet.id === walletId);
  }

  /**
   * Get supported wallets
   */
  getSupportedWallets(): WalletInfo[] {
    return this.state.supportedWallets || [];
  }


  /**
   * Get current state
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<WalletState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Safe Ethereum request with error handling
   */
  private async safeEthereumRequest(ethereum: any, request: any): Promise<any> {
    try {
      return await ethereum.request(request);
    } catch (error: any) {
      // Handle specific wallet errors
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      } else if (error.code === 4100) {
        throw new Error('The requested method is not authorized');
      } else if (error.code === 4200) {
        throw new Error('The requested method is not supported');
      } else if (error.code === 4900) {
        throw new Error('Wallet is not connected to the requested chain');
      } else if (error.message?.includes('message port closed')) {
        throw new Error('Wallet extension connection was interrupted. Please try again.');
      } else if (error.message?.includes('User denied')) {
        throw new Error('User denied the connection request');
      } else {
        throw new Error(error.message || 'Unknown wallet error occurred');
      }
    }
  }

  /**
   * Handle wallet-specific errors
   */
  private handleWalletError(error: any, walletName: string): void {
    let errorMessage = error.message || 'Unknown error';
    
    // Common error patterns
    if (errorMessage.includes('message port closed')) {
      errorMessage = `${walletName} extension connection was interrupted. Please ensure the extension is running and try again.`;
    } else if (errorMessage.includes('User rejected')) {
      errorMessage = `Connection to ${walletName} was rejected. Please approve the connection in your wallet.`;
    } else if (errorMessage.includes('not installed')) {
      errorMessage = `${walletName} is not installed. Please install the extension and refresh the page.`;
    }

    const walletError: WalletError = {
      code: 'WALLET_CONNECTION_ERROR',
      message: errorMessage,
      details: { 
        walletName, 
        originalError: error.message,
        stack: error.stack 
      },
      timestamp: new Date()
    };

    this.setState({
      errors: [...this.state.errors, walletError]
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: Error, context: string): void {
    const walletError: WalletError = {
      code: 'WALLET_ERROR',
      message: error.message,
      details: { context, stack: error.stack },
      timestamp: new Date()
    };

    this.setState({
      errors: [...this.state.errors, walletError]
    });
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.setState({ errors: [] });
  }

  /**
   * Emit wallet events
   */
  private emitEvent(type: string, data: any): void {
    // This would integrate with a proper event system
    console.log('Wallet event:', type, data);
  }

  /**
   * Load persisted connections from localStorage
   */
  private loadPersistedConnections(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const persisted = localStorage.getItem('bridgespark-wallet-connections');
      if (persisted) {
        const data = JSON.parse(persisted);
        // Restore connections (without sensitive data)
        // This is a simplified version - in production, you'd want more security
      }
    } catch (error) {
      // Silently handle errors during SSR
      if (typeof window !== 'undefined') {
        console.error('Error loading persisted connections:', error);
      }
    }
  }

  /**
   * Persist connections to localStorage
   */
  private persistConnections(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      // Only persist non-sensitive data
      const data = {
        connections: this.state.connections.map(conn => ({
          walletId: conn.walletId,
          address: conn.address,
          chainId: conn.chainId,
          network: conn.network,
          connectedAt: conn.connectedAt,
          lastUsed: conn.lastUsed
        })),
        exchangeConnections: this.state.exchangeConnections.map(conn => ({
          exchangeId: conn.exchangeId,
          name: conn.name,
          type: conn.type,
          status: conn.status,
          connectedAt: conn.connectedAt
        }))
      };

      localStorage.setItem('bridgespark-wallet-connections', JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting connections:', error);
    }
  }

  /**
   * Check if auto-connect should be enabled
   */
  private shouldAutoConnect(): boolean {
    // Check user preferences and previous connections
    return false; // Disabled by default for security
  }

  /**
   * Auto-connect to previously connected wallets
   */
  private async autoConnect(): Promise<void> {
    // Implementation for auto-connecting to previously connected wallets
    // This should be done carefully with proper security measures
  }

  /**
   * Set up event listeners for wallet events
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          this.setState({ 
            connections: [],
            activeConnection: undefined
          });
        } else {
          // Account changed
          this.emitEvent('accountChanged', { accounts });
        }
      });

      // Listen for chain changes
      (window as any).ethereum.on('chainChanged', (chainId: string) => {
        this.emitEvent('chainChanged', { chainId });
      });
    }
  }
}

// Export singleton instance - only create in browser environment
let walletServiceInstance: WalletService | null = null;

export const getWalletService = (): WalletService => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      getState: () => ({
        connections: [],
        exchangeConnections: [],
        errors: [],
        isConnecting: false,
        supportedWallets: []
      }),
      subscribe: () => () => {},
      connectWallet: async () => {},
      disconnectWallet: async () => {},
      getSupportedWallets: () => [],
      getWalletInfo: () => undefined,
      isWalletInstalled: () => false,
      connectExchange: async () => {},
      disconnectExchange: async () => {},
      getExchangeConnections: () => [],
      getConnectionHistory: () => [],
      clearErrors: () => {},
      getErrors: () => []
    } as any;
  }
  
  if (!walletServiceInstance) {
    walletServiceInstance = new WalletService();
  }
  
  return walletServiceInstance;
};

export const walletService = getWalletService();
export default walletService;
