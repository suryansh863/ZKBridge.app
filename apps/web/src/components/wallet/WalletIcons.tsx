/**
 * Wallet Icons Component
 * Proper SVG icons for different wallet providers
 */

import React from 'react';

interface WalletIconProps {
  walletId: string;
  className?: string;
}

export function WalletIcon({ walletId, className = "w-8 h-8" }: WalletIconProps) {
  const iconMap: { [key: string]: React.ReactNode } = {
    metaMask: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    coinbaseWallet: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.333.034-.485.095l-2.784 1.58c-.152.086-.25.24-.25.41v.71c0 .17.098.324.25.41l2.784 1.58c.152.061.316.095.485.095.345 0 .625-.28.625-.625V8.785c0-.345-.28-.625-.625-.625z" fill="#0052FF"/>
      </svg>
    ),
    walletConnect: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.333.034-.485.095l-2.784 1.58c-.152.086-.25.24-.25.41v.71c0 .17.098.324.25.41l2.784 1.58c.152.061.316.095.485.095.345 0 .625-.28.625-.625V8.785c0-.345-.28-.625-.625-.625z" fill="#3B99FC"/>
      </svg>
    ),
    trustWallet: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.333.034-.485.095l-2.784 1.58c-.152.086-.25.24-.25.41v.71c0 .17.098.324.25.41l2.784 1.58c.152.061.316.095.485.095.345 0 .625-.28.625-.625V8.785c0-.345-.28-.625-.625-.625z" fill="#3375BB"/>
      </svg>
    ),
    rainbow: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B6B"/>
            <stop offset="16.66%" stopColor="#4ECDC4"/>
            <stop offset="33.33%" stopColor="#45B7D1"/>
            <stop offset="50%" stopColor="#96CEB4"/>
            <stop offset="66.66%" stopColor="#FFEAA7"/>
            <stop offset="83.33%" stopColor="#DDA0DD"/>
            <stop offset="100%" stopColor="#98D8C8"/>
          </linearGradient>
        </defs>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.333.034-.485.095l-2.784 1.58c-.152.086-.25.24-.25.41v.71c0 .17.098.324.25.41l2.784 1.58c.152.061.316.095.485.095.345 0 .625-.28.625-.625V8.785c0-.345-.28-.625-.625-.625z" fill="url(#rainbow)"/>
      </svg>
    ),
    exodus: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.333.034-.485.095l-2.784 1.58c-.152.086-.25.24-.25.41v.71c0 .17.098.324.25.41l2.784 1.58c.152.061.316.095.485.095.345 0 .625-.28.625-.625V8.785c0-.345-.28-.625-.625-.625z" fill="#7C3AED"/>
      </svg>
    )
  };

  return (
    <div className="flex items-center justify-center">
      {iconMap[walletId] || (
        <div className={`${className} bg-gray-500 rounded-full flex items-center justify-center text-white font-bold`}>
          ?
        </div>
      )}
    </div>
  );
}

// Alternative: Use proper wallet icons with better designs
export function MetaMaskIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
      🦊
    </div>
  );
}

export function CoinbaseIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
      ⚡
    </div>
  );
}

export function WalletConnectIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
      🔗
    </div>
  );
}

export function TrustWalletIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
      🛡️
    </div>
  );
}

export function RainbowIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
      🌈
    </div>
  );
}

export function ExodusIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
      🔮
    </div>
  );
}
