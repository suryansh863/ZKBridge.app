/**
 * Wallet Error Boundary Component
 * Catches and displays wallet-related errors gracefully
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Wallet Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Wallet Connection Error
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Something went wrong while connecting to your wallet. This might be due to:
              </p>
              
              <ul className="text-sm text-gray-400 space-y-1 mb-4">
                <li>• Wallet extension not installed</li>
                <li>• Network connection issues</li>
                <li>• User rejected the connection</li>
                <li>• Unsupported network</li>
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wallet Error Toast Component
 */
interface WalletErrorToastProps {
  error: string;
  onDismiss: () => void;
  type?: 'error' | 'warning' | 'info';
}

export function WalletErrorToast({ error, onDismiss, type = 'error' }: WalletErrorToastProps) {
  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-red-500/10 border-red-500/30 text-red-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-xl border ${getToastStyles()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium">{error}</p>
        </div>
        
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Wallet Error List Component
 */
interface WalletErrorListProps {
  errors: Array<{
    id: string;
    message: string;
    timestamp: Date;
    type?: 'error' | 'warning' | 'info';
  }>;
  onClear: () => void;
  onDismiss: (id: string) => void;
}

export function WalletErrorList({ errors, onClear, onDismiss }: WalletErrorListProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Recent Errors</h3>
        <button
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-2">
        {errors.slice(-5).map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {error.timestamp.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onDismiss(error.id)}
                className="flex-shrink-0 p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <X className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


