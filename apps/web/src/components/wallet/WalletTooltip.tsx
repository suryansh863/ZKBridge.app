/**
 * Wallet Tooltip Component
 * Provides contextual help and information for wallet features
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface WalletTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function WalletTooltip({ 
  content, 
  title, 
  type = 'info', 
  position = 'top',
  maxWidth = '300px',
  children,
  disabled = false
}: WalletTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsPinned(false);
      }
    };

    if (isPinned) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPinned]);

  const getTooltipStyles = () => {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          iconBg: 'bg-blue-500/20'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          icon: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20'
        };
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          icon: 'text-green-400',
          iconBg: 'bg-green-500/20'
        };
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-400',
          iconBg: 'bg-red-500/20'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          icon: 'text-gray-400',
          iconBg: 'bg-gray-500/20'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  const styles = getTooltipStyles();

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => !isPinned && setIsVisible(false)}
      onClick={() => setIsPinned(!isPinned)}
    >
      {children}
      
      <AnimatePresence>
        {(isVisible || isPinned) && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 ${getPositionClasses()}`}
            style={{ maxWidth }}
          >
            <div className={`relative p-3 rounded-lg border ${styles.bg} ${styles.border} shadow-lg`}>
              {/* Arrow */}
              <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
              
              {/* Content */}
              <div className="flex items-start gap-2">
                <div className={`w-6 h-6 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <div className={styles.icon}>
                    {getIcon()}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  {title && (
                    <h4 className="text-sm font-semibold text-white mb-1">
                      {title}
                    </h4>
                  )}
                  <div className="text-sm text-gray-300">
                    {typeof content === 'string' ? content : content}
                  </div>
                </div>
                
                {isPinned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPinned(false);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Simple tooltip for inline help
 */
interface SimpleTooltipProps {
  content: string;
  children: React.ReactNode;
}

export function SimpleTooltip({ content, children }: SimpleTooltipProps) {
  return (
    <WalletTooltip content={content} type="info" position="top">
      {children}
    </WalletTooltip>
  );
}

/**
 * Help icon with tooltip
 */
interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export function HelpTooltip({ content, title, type = 'info' }: HelpTooltipProps) {
  return (
    <WalletTooltip content={content} title={title} type={type}>
      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
        <HelpCircle className="w-4 h-4 text-gray-400" />
      </button>
    </WalletTooltip>
  );
}

/**
 * Predefined tooltip content for common wallet scenarios
 */
export const WalletTooltips = {
  // Connection tooltips
  connectWallet: {
    title: 'Connect Your Wallet',
    content: 'Connect your crypto wallet to interact with BridgeSpark. We support MetaMask, Coinbase Wallet, Trust Wallet, and more.'
  },
  
  // Security tooltips
  privateKeys: {
    title: 'Your Private Keys Stay Safe',
    content: 'BridgeSpark never has access to your private keys. All transactions are signed locally in your wallet.'
  },
  
  // Network tooltips
  networkSwitch: {
    title: 'Network Requirements',
    content: 'Make sure you\'re connected to the correct network. BridgeSpark works on Ethereum, Polygon, Arbitrum, and other EVM-compatible chains.'
  },
  
  // Gas tooltips
  gasFees: {
    title: 'Gas Fees',
    content: 'Gas fees are required for blockchain transactions. Fees vary based on network congestion and transaction complexity.'
  },
  
  // Exchange tooltips
  exchangeConnection: {
    title: 'Exchange Integration',
    content: 'Connect your exchange account to access your trading balances and execute trades directly from BridgeSpark.'
  },
  
  // CoinDCX specific
  coindcxApiKeys: {
    title: 'CoinDCX API Keys',
    content: 'Generate API keys in your CoinDCX account settings. Make sure to set appropriate permissions and never share your API secret.'
  },
  
  // Transaction tooltips
  transactionStatus: {
    title: 'Transaction Status',
    content: 'Track your transaction status in real-time. Pending transactions may take a few minutes to confirm on the blockchain.'
  },
  
  // Bridge tooltips
  bridgeProcess: {
    title: 'Bridge Process',
    content: 'The bridge process involves locking your Bitcoin, generating a ZK proof, and minting equivalent tokens on Ethereum.'
  }
};


