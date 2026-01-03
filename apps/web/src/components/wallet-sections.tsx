"use client"

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';
import { WalletStatusCompact } from '@/components/wallet/WalletStatus';
import { useWalletConnection } from '@/hooks/useWallet';
import { ClientOnly } from '@/components/client-only';

// Wallet connection component to avoid hydration issues
export function WalletConnectionSection() {
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const { isConnected } = useWalletConnection();

    return (
        <ClientOnly
            fallback={
                <button
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                        "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                        "text-white font-medium shadow-lg hover:shadow-xl hover:scale-105"
                    )}
                >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                </button>
            }
        >
            {isConnected ? (
                <WalletStatusCompact />
            ) : (
                <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                        "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                        "text-white font-medium shadow-lg hover:shadow-xl hover:scale-105"
                    )}
                >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                </button>
            )}

            {/* Wallet Connection Modals */}
            <WalletConnectModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
            />
        </ClientOnly>
    );
}

// Mobile wallet connection component
export function MobileWalletConnectionSection() {
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const { isConnected } = useWalletConnection();

    return (
        <ClientOnly
            fallback={
                <button
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300",
                        "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                        "text-white font-medium shadow-lg hover:shadow-xl"
                    )}
                >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                </button>
            }
        >
            {isConnected ? (
                <WalletStatusCompact />
            ) : (
                <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300",
                        "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                        "text-white font-medium shadow-lg hover:shadow-xl"
                    )}
                >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                </button>
            )}

            {/* Wallet Connection Modals */}
            <WalletConnectModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
            />
        </ClientOnly>
    );
}
