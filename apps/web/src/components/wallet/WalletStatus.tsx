/**
 * Wallet Status Component
 * Shows current wallet connection status and account information
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useWalletConnection, useWalletBalance, useWalletErrors } from '@/hooks/useWallet';
import { formatAddress, formatBalance } from '@/utils/format';

interface WalletStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function WalletStatus({ className = '', showDetails = false }: WalletStatusProps) {
  const { 
    isConnected, 
    address, 
    chainId, 
    network, 
    balance, 
    hasErrors, 
    latestError 
  } = useWalletConnection();
  
  const { balance: currentBalance, isRefreshing, refresh } = useWalletBalance();
  const { errors, clearErrors } = useWalletErrors();
  
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum';
      case 10: return 'Optimism';
      case 8453: return 'Base';
      default: return 'Unknown';
    }
  };

  const getNetworkColor = (network?: string) => {
    switch (network) {
      case 'ethereum': return 'text-blue-400';
      case 'polygon': return 'text-purple-400';
      case 'arbitrum': return 'text-cyan-400';
      case 'optimism': return 'text-red-400';
      case 'base': return 'text-blue-300';
      default: return 'text-gray-400';
    }
  };

  if (!isConnected) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Wallet className="w-4 h-4" />
        <span className="text-sm">Not connected</span>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 rounded-xl border border-gray-700 ${className}`}>
      {/* Main Status */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">Connected</h3>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-sm text-gray-400">{getNetworkName(chainId)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">Balance</span>
          <span className="font-medium text-white">
            {formatBalance(currentBalance)} ETH
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-700 p-4 space-y-4"
        >
          {/* Address */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Address</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-gray-800 px-3 py-2 rounded-lg text-blue-400">
                {formatAddress(address || '')}
              </code>
              <button
                onClick={handleCopyAddress}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Network Info */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Network</label>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getNetworkColor(network)}`}>
                {getNetworkName(chainId)}
              </span>
              <span className="text-xs text-gray-500">Chain ID: {chainId}</span>
            </div>
          </div>

          {/* Errors */}
          {hasErrors && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-400">Recent Errors</label>
                <button
                  onClick={clearErrors}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {errors.slice(-3).map((error, index) => (
                  <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-400">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Compact wallet status for headers
 */
export function WalletStatusCompact({ className = '' }: { className?: string }) {
  const { isConnected, address, network } = useWalletConnection();
  const { balance } = useWalletBalance();

  if (!isConnected) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Wallet className="w-4 h-4" />
        <span className="text-sm">Connect Wallet</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Wallet className="w-4 h-4 text-white" />
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {formatBalance(balance)} ETH
        </p>
        <p className="text-xs text-gray-400">
          {formatAddress(address || '')}
        </p>
      </div>
    </div>
  );
}


