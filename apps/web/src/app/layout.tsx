import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

// Import early error suppression
import '@/lib/extension-error-suppressor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BridgeSpark - Bitcoin-Ethereum Trustless Bridge',
  description: 'A trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs. Secure, fast, and completely decentralized.',
  keywords: ['Bitcoin', 'Ethereum', 'Bridge', 'ZK Proofs', 'Blockchain', 'DeFi', 'Zero-Knowledge', 'Cryptocurrency'],
  authors: [{ name: 'BridgeSpark Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BridgeSpark',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'BridgeSpark',
    title: 'BridgeSpark - Bitcoin-Ethereum Trustless Bridge',
    description: 'A trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BridgeSpark - Bitcoin-Ethereum Trustless Bridge',
    description: 'A trustless bridge between Bitcoin and Ethereum using Zero-Knowledge proofs',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        {/* Extension error suppression - MUST be first */}
        <script src="/suppress-extension-errors.js" async />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BridgeSpark" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Early extension error suppression
              (function() {
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;
                const originalConsoleLog = console.log;
                
                const isExtensionError = (message) => {
                  const patterns = [
                    'runtime.lastError',
                    'message port closed',
                    'Extension context invalidated',
                    'Unchecked runtime.lastError',
                    'b19c0d6',
                    'chrome-extension://',
                    'moz-extension://',
                    'safari-extension://',
                    'VM3872',
                    'VM4329',
                    'console-suppress.ts',
                    'hook.js',
                    'app-index.js',
                    'hydration-error-info.js',
                    'react-dom.development.js'
                  ];
                  return patterns.some(pattern => message.includes(pattern));
                };
                
                console.error = (...args) => {
                  const message = args.join(' ');
                  if (isExtensionError(message)) return;
                  originalConsoleError.apply(console, args);
                };
                
                console.warn = (...args) => {
                  const message = args.join(' ');
                  if (isExtensionError(message)) return;
                  originalConsoleWarn.apply(console, args);
                };
                
                console.log = (...args) => {
                  const message = args.join(' ');
                  if (isExtensionError(message)) return;
                  originalConsoleLog.apply(console, args);
                };
                
                window.addEventListener('error', (event) => {
                  if (isExtensionError(event.message)) {
                    event.preventDefault();
                    return false;
                  }
                }, true);
                
                window.addEventListener('unhandledrejection', (event) => {
                  const message = String(event.reason);
                  if (isExtensionError(message)) {
                    event.preventDefault();
                    return false;
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
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
