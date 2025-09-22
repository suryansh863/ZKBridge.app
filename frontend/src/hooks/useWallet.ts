import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { useQuery } from '@tanstack/react-query';

export function useWallet() {
  const { address, isConnected, connector } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connect, connectors, error: connectError, isPending: isConnecting } = useConnect();
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
    isConnecting,
  };
}

