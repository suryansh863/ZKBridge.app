/**
 * Wallet Connect Modal Component
 * zkBridge-style modern wallet connection interface
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield,
  Loader2
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { WalletInfo } from '@/types/wallet';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (walletId: string) => void;
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const { connectWallet, getSupportedWallets } = useWallet();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [loadingWallet, setLoadingWallet] = useState<string | null>(null);

  const wallets = getSupportedWallets();

  const handleWalletSelect = async (walletId: string) => {
    try {
      setConnectionError(null);
      setLoadingWallet(walletId);
      await connectWallet(walletId);
      onConnect?.(walletId);
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(errorMessage);
    } finally {
      setLoadingWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            {/* Error Display */}
            {connectionError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm">{connectionError}</p>
              </div>
            )}

            {/* Wallet Grid - 2 columns as requested */}
            <div className="grid grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <WalletGridButton
                  key={wallet.id}
                  wallet={wallet}
                  onClick={() => handleWalletSelect(wallet.id)}
                  isLoading={loadingWallet === wallet.id}
                />
              ))}
            </div>

            {/* Empty state */}
            {wallets.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No wallets available</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Install a browser wallet to get started</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl py-3">
              <Shield className="w-4 h-4" />
              <span>Your private keys are never shared with BridgeSpark</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface WalletButtonProps {
  wallet: WalletInfo;
  onClick: () => void;
  isLoading?: boolean;
}

function WalletGridButton({ wallet, onClick, isLoading }: WalletButtonProps) {
  const getWalletIcon = (walletId: string) => {
    const iconMap: { [key: string]: { bg: string; icon: string; name: string } } = {
      metamask: { 
        bg: 'bg-gradient-to-br from-orange-400 to-orange-600', 
        icon: '🦊',
        name: 'MetaMask'
      },
      binance: { 
        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', 
        icon: '🔶',
        name: 'Binance Web3 Wallet'
      },
      trust: { 
        bg: 'bg-gradient-to-br from-blue-500 to-blue-700', 
        icon: '🔷',
        name: 'Trust Wallet'
      },
      okx: { 
        bg: 'bg-gradient-to-br from-purple-500 to-purple-700', 
        icon: '⚡',
        name: 'OKX Wallet'
      },
      coinbase: { 
        bg: 'bg-gradient-to-br from-blue-600 to-blue-800', 
        icon: '🔵',
        name: 'Coinbase Wallet'
      },
      bitget: { 
        bg: 'bg-gradient-to-br from-green-500 to-green-700', 
        icon: '🟢',
        name: 'Bitget Wallet'
      }
    };
    return iconMap[walletId] || { bg: 'bg-gradient-to-br from-gray-500 to-gray-700', icon: '💳', name: wallet.name };
  };

  const walletIcon = getWalletIcon(wallet.id);

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className="relative w-full flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
    >
      {/* Wallet Icon with official colors */}
      <div className={`w-16 h-16 rounded-2xl ${walletIcon.bg} flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
        {walletIcon.icon}
      </div>

      {/* Wallet Name */}
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
          {walletIcon.name}
        </h3>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-2xl backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}
    </motion.button>
  );
}
