"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { config, chains } from '@/lib/wagmi';
import { useState, useEffect } from 'react';
import { BackToTop } from '@/components/back-to-top';
import { ErrorBoundary } from '@/components/error-boundary';
import '@/lib/console-suppress';

import '@rainbow-me/rainbowkit/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && 'status' in error && 
              typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  }));

  useEffect(() => {
    setMounted(true);
    
    // Handle extension communication errors
    const handleExtensionError = (event: ErrorEvent) => {
      if (event.message?.includes('runtime.lastError') || 
          event.message?.includes('message port closed')) {
        // Silently ignore extension communication errors
        event.preventDefault();
        return false;
      }
    };

    // Handle unhandled promise rejections from extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('runtime.lastError') ||
          event.reason?.message?.includes('message port closed')) {
        // Silently ignore extension communication errors
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleExtensionError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleExtensionError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <NextThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {mounted ? (
              <RainbowKitProvider
                chains={chains}
                theme={{
                  lightMode: lightTheme({
                    accentColor: '#6366f1',
                    accentColorForeground: 'white',
                    borderRadius: 'medium',
                    fontStack: 'system',
                    overlayBlur: 'small',
                  }),
                  darkMode: darkTheme({
                    accentColor: '#6366f1',
                    accentColorForeground: 'white',
                    borderRadius: 'medium',
                    fontStack: 'system',
                    overlayBlur: 'small',
                  }),
                }}
                appInfo={{
                  appName: 'ZKBridge',
                  learnMoreUrl: 'https://docs.zkbridge.app',
                }}
                showRecentTransactions={true}
                modalSize="compact"
              >
                {children}
              </RainbowKitProvider>
            ) : (
              <div className="min-h-screen bg-background">
                {children}
              </div>
            )}
            <BackToTop />
          </NextThemeProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </ErrorBoundary>
  );
}

