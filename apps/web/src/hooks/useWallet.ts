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
      isTrust?: boolean;
      isRainbow?: boolean;
    };
  }
}

// No extension detection needed - direct link approach

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
    connectWallet: async (walletId: string) => {
      // Direct link approach - always open the wallet's official page
      const walletUrls: { [key: string]: string } = {
        metaMask: 'https://metamask.io/download/',
        coinbaseWallet: 'https://www.coinbase.com/wallet',
        trustWallet: 'https://trustwallet.com/download',
        exodus: 'https://www.exodus.com/download/',
        walletConnect: 'https://walletconnect.com/',
        rainbow: 'https://rainbow.me/',
      };
      
      const walletUrl = walletUrls[walletId];
      if (walletUrl) {
        // Directly open the wallet's official page
        window.open(walletUrl, '_blank', 'noopener,noreferrer');
        throw new Error(`Opening ${walletId} official page. Please install the wallet and return to connect.`);
      } else {
        throw new Error(`Wallet ${walletId} not supported.`);
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
      isInstalled: true, // Always show as available - will open download page
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
      isInstalled: true, // Always show as available - will open download page
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
      isInstalled: true, // Always show as available - will open download page
      downloadUrl: 'https://www.exodus.com/download/',
    },
  ];
}