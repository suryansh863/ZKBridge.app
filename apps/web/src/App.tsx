import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'
import { PerformanceOptimizer } from '@/components/performance-optimizer'

// Lazy load all pages for code splitting
const Home = lazy(() => import('@/pages/Home'))
const Bridge = lazy(() => import('@/pages/Bridge'))
const Transactions = lazy(() => import('@/pages/Transactions'))
const Docs = lazy(() => import('@/pages/Docs'))
const Faq = lazy(() => import('@/pages/Faq'))
const Contact = lazy(() => import('@/pages/Contact'))
const FeeCalculator = lazy(() => import('@/pages/FeeCalculator'))
const NetworkStatus = lazy(() => import('@/pages/NetworkStatus'))
const BridgeAssets = lazy(() => import('@/pages/BridgeAssets'))
const Documentation = lazy(() => import('@/pages/Documentation'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <PerformanceOptimizer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bridge" element={<Bridge />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/fee-calculator" element={<FeeCalculator />} />
            <Route path="/network-status" element={<NetworkStatus />} />
            <Route path="/bridge-assets" element={<BridgeAssets />} />
            <Route path="/documentation" element={<Documentation />} />
          </Routes>
        </Suspense>
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
    </BrowserRouter>
  )
}
