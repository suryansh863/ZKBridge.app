import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZKBridge - Bitcoin-Ethereum Trustless Bridge',
  description: 'A trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs. Secure, fast, and completely decentralized.',
  keywords: ['Bitcoin', 'Ethereum', 'Bridge', 'ZK Proofs', 'Blockchain', 'DeFi', 'Zero-Knowledge', 'Cryptocurrency'],
  authors: [{ name: 'ZKBridge Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
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
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
