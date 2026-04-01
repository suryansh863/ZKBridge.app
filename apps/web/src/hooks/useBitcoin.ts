
import { useState, useEffect, useCallback } from 'react';

export interface BitcoinWalletState {
  address: string | null;
  isConnected: boolean;
  publicKey: string | null;
  balance: number | null;
  network: string | null;
}

export function useBitcoin() {
  const [state, setState] = useState<BitcoinWalletState>({
    address: null,
    isConnected: false,
    publicKey: null,
    balance: null,
    network: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if UniSat is installed
  const isUnisatInstalled = typeof window !== 'undefined' && !!(window as any).unisat;

  const updateState = useCallback(async () => {
    if (!isUnisatInstalled) return;

    try {
      const unisat = (window as any).unisat;
      const accounts = await unisat.getAccounts();
      
      if (accounts.length > 0) {
        const address = accounts[0];
        const publicKey = await unisat.getPublicKey();
        const balance = await unisat.getBalance();
        const network = await unisat.getNetwork();

        setState({
          address,
          isConnected: true,
          publicKey,
          balance: balance.total,
          network,
        });
      } else {
        setState({
          address: null,
          isConnected: false,
          publicKey: null,
          balance: null,
          network: null,
        });
      }
    } catch (err: any) {
      console.error('Error updating Bitcoin wallet state:', err);
    }
  }, [isUnisatInstalled]);

  const resetState = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      publicKey: null,
      balance: null,
      network: null,
    });
  }, []);

  const connect = useCallback(async () => {
    if (!isUnisatInstalled) {
      window.open('https://unisat.io/download', '_blank');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const unisat = (window as any).unisat;
      const accounts = await unisat.requestAccounts();
      
      if (accounts.length > 0) {
        await updateState();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Bitcoin wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [isUnisatInstalled, updateState]);

  const disconnect = useCallback(() => {
    // UniSat doesn't have a direct disconnect, but we can clear local state
    resetState();
  }, [resetState]);

  // Listen for account/network changes
  useEffect(() => {
    if (!isUnisatInstalled) return;

    const unisat = (window as any).unisat;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        updateState();
      } else {
        resetState();
      }
    };

    const handleNetworkChanged = () => {
      updateState();
    };

    unisat.on('accountsChanged', handleAccountsChanged);
    unisat.on('networkChanged', handleNetworkChanged);

    // Initial check
    updateState();

    return () => {
      unisat.removeListener('accountsChanged', handleAccountsChanged);
      unisat.removeListener('networkChanged', handleNetworkChanged);
    };
  }, [isUnisatInstalled, updateState]);

  const getTransactions = useCallback(async () => {
    if (!isUnisatInstalled) return [];
    try {
      const unisat = (window as any).unisat;
      return await unisat.getTransactions();
    } catch (err: any) {
      console.error('Error fetching Bitcoin transactions:', err);
      return [];
    }
  }, [isUnisatInstalled]);

  return {
    ...state,
    isConnecting,
    error,
    connect,
    disconnect,
    isUnisatInstalled,
    getTransactions,
  };
}
