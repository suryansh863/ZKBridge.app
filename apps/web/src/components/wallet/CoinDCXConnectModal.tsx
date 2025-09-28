/**
 * CoinDCX Connect Modal Component
 * Secure form for connecting CoinDCX exchange account
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';
import { useCoinDCX } from '@/hooks/useWallet';
import { CoinDCXCredentials } from '@/types/wallet';

interface CoinDCXConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: () => void;
}

export function CoinDCXConnectModal({ isOpen, onClose, onConnect }: CoinDCXConnectModalProps) {
  const { 
    credentials, 
    updateCredentials, 
    connect, 
    disconnect, 
    isConnecting, 
    error, 
    isConnected,
    account 
  } = useCoinDCX();
  
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [formData, setFormData] = useState<CoinDCXCredentials>({
    apiKey: '',
    apiSecret: '',
    isTestnet: false
  });

  const handleInputChange = (field: keyof CoinDCXCredentials, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update credentials in the hook
    updateCredentials(formData);
    
    // Connect to CoinDCX
    await connect();
    
    if (!error) {
      onConnect?.();
      onClose();
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setFormData({ apiKey: '', apiSecret: '', isTestnet: false });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Connect CoinDCX</h2>
                <p className="text-sm text-gray-400">Secure exchange integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isConnected ? (
              /* Connected State */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Successfully Connected!</h3>
                  <p className="text-gray-400 text-sm">
                    Your CoinDCX account is now connected to BridgeSpark
                  </p>
                </div>

                {account && (
                  <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                    <h4 className="font-medium text-white">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{account.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trading:</span>
                        <span className={`${account.tradingEnabled ? 'text-green-400' : 'text-red-400'}`}>
                          {account.tradingEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">KYC Status:</span>
                        <span className={`${
                          account.kycStatus === 'approved' ? 'text-green-400' : 
                          account.kycStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {account.kycStatus.charAt(0).toUpperCase() + account.kycStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 px-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                >
                  Disconnect Account
                </button>
              </div>
            ) : (
              /* Connection Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Security Notice */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <h4 className="font-medium text-blue-400 mb-1">Security Notice</h4>
                      <p className="text-gray-300">
                        Your API credentials are encrypted and stored locally. They are never shared with our servers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    placeholder="Enter your CoinDCX API Key"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* API Secret */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showApiSecret ? 'text' : 'password'}
                      value={formData.apiSecret}
                      onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                      placeholder="Enter your CoinDCX API Secret"
                      className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showApiSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Testnet Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="testnet"
                    checked={formData.isTestnet}
                    onChange={(e) => handleInputChange('isTestnet', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="testnet" className="text-sm text-gray-300">
                    Use testnet (for testing purposes)
                  </label>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isConnecting || !formData.apiKey || !formData.apiSecret}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Connect CoinDCX
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>End-to-end encrypted</span>
              </div>
              <a
                href="https://coindcx.com/api"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Get API Keys</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


