"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useContractRead, useContractWrite, useWaitForTransaction, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { BridgeContract, WrappedBTC, BTCRelay } from '@/lib/contracts';
import { logger } from '@/lib/logger';

// Contract addresses (these would come from your deployment)
const BRIDGE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || '0x...';
const WRAPPED_BTC_ADDRESS = process.env.NEXT_PUBLIC_WRAPPED_BTC_ADDRESS || '0x...';
const BTC_RELAY_ADDRESS = process.env.NEXT_PUBLIC_BTC_RELAY_ADDRESS || '0x...';

// Contract ABIs (simplified - you'd import the full ABIs)
const BRIDGE_ABI = [
  {
    "inputs": [
      {"name": "btcTxHash", "type": "bytes32"},
      {"name": "merkleProof", "type": "bytes"},
      {"name": "btcAddress", "type": "string"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "claimBitcoin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "amount", "type": "uint256"}
    ],
    "name": "burnWrappedBTC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "bridgeId", "type": "bytes32"}
    ],
    "name": "getBridgeStatus",
    "outputs": [
      {"name": "status", "type": "uint8"},
      {"name": "amount", "type": "uint256"},
      {"name": "fee", "type": "uint256"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "bridgeId", "type": "bytes32"},
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": true, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "btcTxHash", "type": "bytes32"},
      {"indexed": false, "name": "btcAddress", "type": "string"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "BridgeInitiated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "bridgeId", "type": "bytes32"},
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": true, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "fee", "type": "uint256"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "BridgeCompleted",
    "type": "event"
  }
] as const;

const WRAPPED_BTC_ABI = [
  {
    "inputs": [
      {"name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [
      {"name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface BridgeTransaction {
  bridgeId: string;
  btcTxHash: string;
  btcAddress: string;
  amount: string;
  fee: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  merkleProof?: string;
}

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  totalCost: string;
}

export function useEthereum() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bridgeTransactions, setBridgeTransactions] = useState<BridgeTransaction[]>([]);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Get wrapped BTC balance
  const { data: wrappedBTCBalance } = useContractRead({
    address: WRAPPED_BTC_ADDRESS as `0x${string}`,
    abi: WRAPPED_BTC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Get allowance for bridge contract
  const { data: allowance } = useContractRead({
    address: WRAPPED_BTC_ADDRESS as `0x${string}`,
    abi: WRAPPED_BTC_ABI,
    functionName: 'allowance',
    args: address && BRIDGE_CONTRACT_ADDRESS ? [address, BRIDGE_CONTRACT_ADDRESS as `0x${string}`] : undefined,
    enabled: !!address && !!BRIDGE_CONTRACT_ADDRESS,
  });

  // Contract write functions
  const { write: claimBitcoin, data: claimTxHash, isLoading: isClaiming } = useContractWrite({
    address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
    abi: BRIDGE_ABI,
    functionName: 'claimBitcoin',
  });

  const { write: burnWrappedBTC, data: burnTxHash, isLoading: isBurning } = useContractWrite({
    address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
    abi: BRIDGE_ABI,
    functionName: 'burnWrappedBTC',
  });

  const { write: approveWrappedBTC, data: approveTxHash, isLoading: isApproving } = useContractWrite({
    address: WRAPPED_BTC_ADDRESS as `0x${string}`,
    abi: WRAPPED_BTC_ABI,
    functionName: 'approve',
  });

  // Wait for transaction confirmations
  const { isLoading: isClaimConfirming } = useWaitForTransaction({
    hash: claimTxHash?.hash,
    onSuccess: (receipt) => {
      logger.info('Bitcoin claim transaction confirmed', { hash: receipt.transactionHash });
      // Refresh bridge transactions
      fetchBridgeTransactions();
    },
    onError: (error) => {
      logger.error('Bitcoin claim transaction failed', error);
      setError('Failed to claim Bitcoin: ' + error.message);
    },
  });

  const { isLoading: isBurnConfirming } = useWaitForTransaction({
    hash: burnTxHash?.hash,
    onSuccess: (receipt) => {
      logger.info('Wrapped BTC burn transaction confirmed', { hash: receipt.transactionHash });
      // Refresh balances
      fetchBridgeTransactions();
    },
    onError: (error) => {
      logger.error('Wrapped BTC burn transaction failed', error);
      setError('Failed to burn wrapped BTC: ' + error.message);
    },
  });

  const { isLoading: isApproveConfirming } = useWaitForTransaction({
    hash: approveTxHash?.hash,
    onSuccess: (receipt) => {
      logger.info('Approval transaction confirmed', { hash: receipt.transactionHash });
      // Refresh allowance
      fetchBridgeTransactions();
    },
    onError: (error) => {
      logger.error('Approval transaction failed', error);
      setError('Failed to approve wrapped BTC: ' + error.message);
    },
  });

  // Estimate gas for a transaction
  const estimateGas = useCallback(async (
    functionName: string,
    args: any[],
    value?: bigint
  ): Promise<GasEstimate> => {
    if (!publicClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const gasLimit = await publicClient.estimateContractGas({
        address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
        abi: BRIDGE_ABI,
        functionName: functionName as any,
        args: args as any,
        account: address,
        value: value as any,
      });

      const gasPrice = await publicClient.getGasPrice();
      const totalCost = formatEther(gasLimit * gasPrice);

      return {
        gasLimit,
        gasPrice,
        totalCost,
      };
    } catch (error) {
      logger.error('Gas estimation failed', error);
      throw new Error('Failed to estimate gas: ' + (error as Error).message);
    }
  }, [publicClient, address]);

  // Claim Bitcoin on Ethereum
  const claimBitcoinOnEthereum = useCallback(async (
    btcTxHash: string,
    merkleProof: string,
    btcAddress: string,
    amount: string
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert amount to wei (assuming 8 decimals for BTC)
      const amountWei = parseUnits(amount, 8);

      // Estimate gas first
      const gasEst = await estimateGas('claimBitcoin', [
        btcTxHash as `0x${string}`,
        merkleProof as `0x${string}`,
        btcAddress,
        amountWei
      ]);

      setGasEstimate(gasEst);

      // Execute the claim
      claimBitcoin({
        args: [
          btcTxHash as `0x${string}`,
          merkleProof as `0x${string}`,
          btcAddress,
          amountWei
        ],
        gas: gasEst.gasLimit,
      });

    } catch (error) {
      logger.error('Failed to claim Bitcoin', error);
      setError('Failed to claim Bitcoin: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, estimateGas, claimBitcoin]);

  // Burn wrapped BTC to initiate Bitcoin withdrawal
  const burnWrappedBTCForBitcoin = useCallback(async (amount: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert amount to wei
      const amountWei = parseUnits(amount, 8);

      // Check if we have enough allowance
      if (!allowance || allowance < amountWei) {
        // Need to approve first
        const approveAmount = amountWei * BigInt(2); // Approve 2x to avoid frequent approvals
        approveWrappedBTC({
          args: [BRIDGE_CONTRACT_ADDRESS as `0x${string}`, approveAmount],
        });
        return;
      }

      // Estimate gas
      const gasEst = await estimateGas('burnWrappedBTC', [amountWei]);
      setGasEstimate(gasEst);

      // Execute the burn
      burnWrappedBTC({
        args: [amountWei],
        gas: gasEst.gasLimit,
      });

    } catch (error) {
      logger.error('Failed to burn wrapped BTC', error);
      setError('Failed to burn wrapped BTC: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, allowance, estimateGas, burnWrappedBTC, approveWrappedBTC]);

  // Fetch bridge transactions from events
  const fetchBridgeTransactions = useCallback(async () => {
    if (!publicClient || !address) {
      return;
    }

    try {
      // Get BridgeInitiated events
      const initiatedEvents = await publicClient.getLogs({
        address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
        event: {
          type: 'event',
          name: 'BridgeInitiated',
          inputs: [
            { indexed: true, name: 'bridgeId', type: 'bytes32' },
            { indexed: true, name: 'user', type: 'address' },
            { indexed: true, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'btcTxHash', type: 'bytes32' },
            { indexed: false, name: 'btcAddress', type: 'string' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
          ]
        },
        args: {
          user: address
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      // Get BridgeCompleted events
      const completedEvents = await publicClient.getLogs({
        address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
        event: {
          type: 'event',
          name: 'BridgeCompleted',
          inputs: [
            { indexed: true, name: 'bridgeId', type: 'bytes32' },
            { indexed: true, name: 'user', type: 'address' },
            { indexed: true, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'fee', type: 'uint256' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
          ]
        },
        args: {
          user: address
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      // Process events into bridge transactions
      const transactions: BridgeTransaction[] = initiatedEvents.map(event => {
        const completedEvent = completedEvents.find(
          e => e.args.bridgeId === event.args.bridgeId
        );

        return {
          bridgeId: event.args.bridgeId || '',
          btcTxHash: event.args.btcTxHash || '',
          btcAddress: event.args.btcAddress || '',
          amount: formatUnits(event.args.amount || BigInt(0), 8),
          fee: completedEvent ? formatUnits(completedEvent.args.fee || BigInt(0), 8) : '0',
          status: completedEvent ? 'completed' : 'pending',
          timestamp: Number(event.args.timestamp),
        };
      });

      setBridgeTransactions(transactions);
    } catch (error) {
      logger.error('Failed to fetch bridge transactions', error);
      setError('Failed to fetch bridge transactions: ' + (error as Error).message);
    }
  }, [publicClient, address]);

  // Listen for new bridge events
  useEffect(() => {
    if (!publicClient || !address) {
      return;
    }

    const unwatch = publicClient.watchContractEvent({
      address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
      abi: BRIDGE_ABI,
      eventName: 'BridgeInitiated',
      args: {
        user: address
      },
      onLogs: (logs) => {
        logger.info('New bridge initiated', logs);
        fetchBridgeTransactions();
      },
    });

    const unwatchCompleted = publicClient.watchContractEvent({
      address: BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
      abi: BRIDGE_ABI,
      eventName: 'BridgeCompleted',
      args: {
        user: address
      },
      onLogs: (logs) => {
        logger.info('Bridge completed', logs);
        fetchBridgeTransactions();
      },
    });

    return () => {
      unwatch();
      unwatchCompleted();
    };
  }, [publicClient, address, fetchBridgeTransactions]);

  // Fetch transactions on mount
  useEffect(() => {
    if (isConnected && address) {
      fetchBridgeTransactions();
    }
  }, [isConnected, address, fetchBridgeTransactions]);

  return {
    // Connection state
    isConnected,
    address,
    
    // Balances
    ethBalance: ethBalance ? formatEther(ethBalance.value) : '0',
    wrappedBTCBalance: wrappedBTCBalance ? formatUnits(wrappedBTCBalance, 8) : '0',
    allowance: allowance ? formatUnits(allowance, 8) : '0',
    
    // Bridge transactions
    bridgeTransactions,
    
    // Gas estimation
    gasEstimate,
    
    // Loading states
    isLoading: isLoading || isClaiming || isBurning || isApproving || isClaimConfirming || isBurnConfirming || isApproveConfirming,
    isClaiming,
    isBurning,
    isApproving,
    
    // Error handling
    error,
    setError,
    
    // Functions
    claimBitcoinOnEthereum,
    burnWrappedBTCForBitcoin,
    estimateGas,
    fetchBridgeTransactions,
  };
}

