"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { config } from '@/lib/wagmi';
import { useState } from 'react';

import '@rainbow-me/rainbowkit/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
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

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RainbowKitProvider
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
        </NextThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

