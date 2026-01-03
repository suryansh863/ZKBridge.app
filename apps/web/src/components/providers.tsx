"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BackToTop } from '@/components/back-to-top';
import { ErrorBoundary } from '@/components/error-boundary';
import '@/lib/console-suppress';

// Lazy-load the heavy wallet provider
const WalletProvider = dynamic(() => import('./wallet-provider').then(mod => mod.WalletProvider), {
  ssr: false,
  loading: () => null
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes (increased for better performance)
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && 'status' in error &&
            typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2; // Reduced retry attempts
        },
        // Performance optimization: reduce refetch frequency
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  }));

  useEffect(() => {
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
      <QueryClientProvider client={queryClient}>
        <NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            {children}
          </WalletProvider>
          <BackToTop />
        </NextThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

