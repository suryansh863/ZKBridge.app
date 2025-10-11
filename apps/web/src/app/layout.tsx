import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import { PerformanceOptimizer } from '@/components/performance-optimizer';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: 'ZKBridge - Bitcoin-Ethereum Trustless Bridge',
  description: 'A trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs. Secure, fast, and completely decentralized.',
  keywords: ['Bitcoin', 'Ethereum', 'Bridge', 'ZK Proofs', 'Blockchain', 'DeFi', 'Zero-Knowledge', 'Cryptocurrency'],
  authors: [{ name: 'ZKBridge Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZKBridge',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'ZKBridge',
    title: 'ZKBridge - Bitcoin-Ethereum Trustless Bridge',
    description: 'A trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZKBridge - Bitcoin-Ethereum Trustless Bridge',
    description: 'A trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ZKBridge" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.blockstream.info" />
        
        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              margin: 0;
              padding: 0;
              min-height: 100vh;
              background-color: hsl(var(--background));
              color: hsl(var(--foreground));
            }
            .loading { opacity: 0.7; }
            .fade-in { animation: fadeIn 0.3s ease-in; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            /* Prevent FOUC */
            .theme-transition { transition: background-color 0.3s ease, color 0.3s ease; }
          `
        }} />
      </head>
      <body className={`${inter.className} theme-transition`}>
        <Providers>
          <PerformanceOptimizer />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
