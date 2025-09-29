import { useState } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { WalletInfo } from '@/types/wallet';

// Extend window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isExodus?: boolean;
    };
  }
}

export function useWallet() {
  const { address, isConnected, connector } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  // Get ENS name if available
  const { data: ensName } = useQuery({
    queryKey: ['ensName', address],
    queryFn: async () => {
      if (!address) return null;
      // In a real app, you'd fetch ENS name here
      return null;
    },
    enabled: !!address,
  });

  return {
    address,
    isConnected,
    balance,
    ensName,
    connector,
    connect,
    disconnect,
    connectors,
    connectError,
    isConnecting: false,
    // Additional functions for compatibility
    connectWallet: async (walletId: string) => {
      try {
        console.log('=== WALLET CONNECTION DEBUG ===');
        console.log('Requested wallet:', walletId);
        console.log('Available connectors:', connectors.map(c => ({ 
          id: c.id, 
          name: c.name
        })));
        
        // Try multiple approaches to find the right connector
        let targetConnector = null;
        
        // Approach 1: Direct index-based selection (most reliable)
        if (walletId === 'metaMask') {
          targetConnector = connectors[0]; // MetaMask is first
        } else if (walletId === 'coinbaseWallet') {
          targetConnector = connectors[1]; // Coinbase is second
        } else if (walletId === 'walletConnect' || walletId === 'trustWallet' || walletId === 'rainbow') {
          // WalletConnect is third (if available), otherwise use injected
          targetConnector = connectors.length > 2 ? connectors[2] : connectors[connectors.length - 1];
        } else if (walletId === 'exodus') {
          // Exodus is last
          targetConnector = connectors[connectors.length - 1];
        }
        
        // Approach 2: Try to find by exact ID match
        if (!targetConnector) {
          targetConnector = connectors.find(c => c.id === walletId);
        }
        
        // Approach 3: Try to find by name match
        if (!targetConnector) {
          targetConnector = connectors.find(c => c.name === walletId);
        }
        
        // Approach 4: Try to find by partial match
        if (!targetConnector) {
          targetConnector = connectors.find(c => 
            c.id.includes(walletId) || 
            c.name.includes(walletId) ||
            walletId.includes(c.id) ||
            walletId.includes(c.name)
          );
        }
        
        // Approach 5: For mobile wallets, try WalletConnect
        if (!targetConnector && (walletId === 'trustWallet' || walletId === 'rainbow')) {
          targetConnector = connectors.find(c => c.id === 'walletConnect' || c.name === 'WalletConnect');
        }
        
        if (targetConnector) {
          console.log(`✅ Found connector for ${walletId}:`, {
            id: targetConnector.id,
            name: targetConnector.name
          });
          
          // Use wagmi's connect function directly
          await connect({ connector: targetConnector });
          console.log(`🎉 Successfully connected to ${walletId}`);
        } else {
          console.error(`❌ No connector found for ${walletId}`);
          console.log('Available connectors:', connectors.map(c => `${c.id} (${c.name})`));
          throw new Error(`Wallet ${walletId} not found. Available connectors: ${connectors.map(c => `${c.id} (${c.name})`).join(', ')}`);
        }
      } catch (error) {
        console.error('Wallet connection error:', error);
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            throw new Error('Connection cancelled by user');
          } else if (error.message.includes('Unauthorized') || error.message.includes('invalid key')) {
            throw new Error('Wallet connection service temporarily unavailable. Please try again later.');
          } else if (error.message.includes('not found')) {
            throw new Error('Wallet not installed. Please install the wallet extension and try again.');
          }
        }
        throw error;
      }
    },
    getSupportedWallets: () => getSupportedWalletsList(),
  };
}

// Export individual hooks for specific use cases
export function useWalletConnection() {
  const { isConnected, address, connector } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  // Mock chainId for now - you can get this from useNetwork hook if needed
  const chainId = 1; // Default to Ethereum mainnet

  // Get network name from chainId
  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'ethereum';
      case 137: return 'polygon';
      case 42161: return 'arbitrum';
      case 10: return 'optimism';
      case 8453: return 'base';
      default: return 'unknown';
    }
  };

  return {
    isConnected,
    address,
    connector,
    chainId,
    network: getNetworkName(chainId),
    connect,
    disconnect,
    connectors,
    connectError,
    isConnecting: false, // Mock for now
    hasErrors: !!connectError,
    latestError: connectError,
  };
}

export function useWalletBalance() {
  const { address } = useAccount();
  const { data: balance, isLoading, error, refetch } = useBalance({
    address: address,
  });

  return {
    balance,
    isLoading,
    isRefreshing: isLoading,
    error,
    address,
    refresh: refetch,
  };
}

export function useWalletErrors() {
  const { error: connectError } = useConnect();
  const { error: disconnectError } = useDisconnect();

  // Mock errors array for now - you can implement proper error tracking
  const errors = [];
  if (connectError) {
    errors.push({
      message: connectError.message,
      timestamp: Date.now(),
    });
  }
  if (disconnectError) {
    errors.push({
      message: disconnectError.message,
      timestamp: Date.now(),
    });
  }

  return {
    connectError,
    disconnectError,
    errors,
    clearErrors: () => {}, // Implement proper error clearing
  };
}

// CoinDCX hook placeholder - you can implement this based on your CoinDCX integration
export function useCoinDCX() {
  // This is a placeholder - implement based on your CoinDCX SDK integration
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      setAccount({
        email: 'user@example.com',
        tradingEnabled: true,
        kycStatus: 'approved'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    setIsConnected(false);
    setAccount(null);
    setCredentials(null);
    setError(null);
  };

  const updateCredentials = (newCredentials: any) => {
    setCredentials(newCredentials);
  };

  return {
    isConnected,
    isConnecting,
    error,
    credentials,
    account,
    connect,
    disconnect,
    updateCredentials,
  };
}

// Utility function to get supported wallets
export function getSupportedWallets(): WalletInfo[] {
  return getSupportedWalletsList();
}

function getSupportedWalletsList(): WalletInfo[] {
  return [
    {
      id: 'metaMask',
      name: 'MetaMask',
      type: 'metamask',
      category: 'browser',
      icon: '/wallets/metamask.svg',
      description: 'Connect using MetaMask browser extension',
      supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
      isInstalled: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
      downloadUrl: 'https://metamask.io/download/',
    },
    {
      id: 'coinbaseWallet',
      name: 'Coinbase Wallet',
      type: 'coinbase',
      category: 'browser',
      icon: '/wallets/coinbase.svg',
      description: 'Connect using Coinbase Wallet extension',
      supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
      isInstalled: typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet,
      downloadUrl: 'https://www.coinbase.com/wallet',
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      type: 'walletconnect',
      category: 'mobile',
      icon: '/wallets/walletconnect.svg',
      description: 'Connect using any WalletConnect compatible wallet',
      supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
      isInstalled: true,
    },
    {
      id: 'trustWallet',
      name: 'Trust Wallet',
      type: 'trust',
      category: 'mobile',
      icon: '/wallets/trust.svg',
      description: 'Connect using Trust Wallet mobile app',
      supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
      isInstalled: true,
      deepLink: 'trust://',
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      type: 'rainbow',
      category: 'mobile',
      icon: '/wallets/rainbow.svg',
      description: 'Connect using Rainbow mobile wallet',
      supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
      isInstalled: true,
      deepLink: 'rainbow://',
    },
    {
      id: 'exodus',
      name: 'Exodus',
      type: 'exodus',
      category: 'browser',
      icon: '/wallets/exodus.svg',
      description: 'Connect using Exodus wallet',
      supportedNetworks: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
      isInstalled: typeof window !== 'undefined' && !!window.ethereum?.isExodus,
      downloadUrl: 'https://www.exodus.com/download/',
    },
  ];
}