import { useState, useEffect } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect, useChainId } from 'wagmi';
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
  const { address, isConnected, connector: activeConnector } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connectAsync, connectors, error: connectError } = useConnect();
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
    connector: activeConnector,
    chainId,
    connectAsync,
    disconnect,
    connectors,
    connectError,
    isConnecting: false,
    // Network information
    getNetworkInfo: () => {
      const networkNames: { [key: number]: string } = {
        1: 'Ethereum Mainnet',
        11155111: 'Sepolia Testnet',
        5: 'Goerli Testnet',
        137: 'Polygon Mainnet',
        80001: 'Polygon Mumbai Testnet',
        56: 'BSC Mainnet',
        97: 'BSC Testnet',
        42161: 'Arbitrum One',
        421614: 'Arbitrum Sepolia',
        10: 'Optimism',
        420: 'Optimism Sepolia',
        8453: 'Base',
        84532: 'Base Sepolia',
      };

      return {
        chainId,
        networkName: networkNames[chainId] || `Unknown Network (${chainId})`,
        isMainnet: chainId === 1,
        isTestnet: chainId !== 1,
      };
    },

    // Additional functions for compatibility
    connectWallet: async (walletId: string) => {
      try {
        console.log('=== WALLET CONNECTION DEBUG ===');
        console.log('Requested walletId:', walletId);
        console.log('Available connectors:', connectors.map(c => ({
          id: c.id,
          name: c.name,
          ready: c.ready
        })));

        // Try to find the right connector with multiple fallback methods
        let targetConnector = null;

        const searchId = walletId.toLowerCase();
        
        // 1. Precise ID match
        targetConnector = connectors.find(c => c.id.toLowerCase() === searchId);
        
        // 2. Name match (e.g. "MetaMask" -> "metamask")
        if (!targetConnector) {
          targetConnector = connectors.find(c => c.name.toLowerCase() === searchId);
        }
        
        // 3. Partial ID or Name match
        if (!targetConnector) {
          targetConnector = connectors.find(c => 
            c.id.toLowerCase().includes(searchId) || 
            c.name.toLowerCase().includes(searchId) ||
            searchId.includes(c.id.toLowerCase())
          );
        }
        
        // 4. Manual mapping for popular wallets
        if (!targetConnector) {
          if (walletId === 'metaMask') {
            targetConnector = connectors.find(c => c.id === 'injected' || c.name === 'Injected');
          } else if (walletId === 'walletConnect' || walletId === 'rainbow' || walletId === 'trustWallet') {
            targetConnector = connectors.find(c => c.id === 'walletConnect');
          } else if (walletId === 'coinbaseWallet') {
            targetConnector = connectors.find(c => c.id === 'coinbaseWallet' || c.name === 'Coinbase Wallet');
          }
        }
        
        // 5. Hardcoded fallbacks if we still haven't found it
        if (!targetConnector) {
          if (walletId === 'metaMask' && connectors[0]) targetConnector = connectors[0];
          else if (walletId === 'coinbaseWallet' && connectors[1]) targetConnector = connectors[1];
        }

        if (targetConnector) {
          console.log(`✅ Using connector: ${targetConnector.name} (${targetConnector.id})`);
          
          if (!targetConnector.ready) {
            console.warn('⚠️ Connector is not marked as ready! Attempting connection anyway...');
          }

          // Use connectAsync to correctly handle the promise-based connection flow
          const result = await connectAsync({ connector: targetConnector });
          console.log('🎉 Connection result:', result);
          
          return result;
        } else {
          console.error(`❌ No connector found for ${walletId}.`);
          throw new Error(`Wallet ${walletId} not found. Please try another wallet or ensure it is installed.`);
        }
      } catch (error) {
        console.error('Wallet connection error details:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            throw new Error('Connection cancelled by user');
          }
          throw error;
        }
        throw new Error('An unexpected error occurred during connection');
      }
    },
    getSupportedWallets: () => getSupportedWalletsList(),
  };
}

// Export individual hooks for specific use cases

export function useWalletBalance() {
  const { address } = useAccount();
  const { data: balance, refetch, isRefetching } = useBalance({
    address: address,
  });

  return {
    balance,
    isRefreshing: isRefetching,
    refresh: refetch,
  };
}

export function useWalletErrors() {
  return {
    errors: [],
    clearErrors: () => { },
  };
}

export function useWalletConnection() {
  const { isConnected, address, connector } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  // Get network name from chainId
  const getNetworkName = (id?: number) => {
    switch (id) {
      case 1: return 'ethereum';
      case 11155111: return 'sepolia';
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
    isConnecting: false,
    hasErrors: !!connectError,
    latestError: connectError,
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