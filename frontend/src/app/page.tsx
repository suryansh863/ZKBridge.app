"use client"

import { Suspense, lazy } from 'react';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LazySection } from '@/components/lazy-section';

// Lazy load heavy components
const BridgeInterface = lazy(() => import('@/components/bridge-interface').then(module => ({ default: module.BridgeInterface })));
const ZKProofVisualizer = lazy(() => import('@/components/zk-proof-visualizer').then(module => ({ default: module.ZKProofVisualizer })));
const TransactionHistory = lazy(() => import('@/components/transaction-history').then(module => ({ default: module.TransactionHistory })));

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        
        {/* Lazy load heavy components with intersection observer */}
        <LazySection>
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }>
            <BridgeInterface />
          </Suspense>
        </LazySection>
        
        <LazySection>
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }>
            <ZKProofVisualizer />
          </Suspense>
        </LazySection>
        
        <LazySection>
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }>
            <TransactionHistory />
          </Suspense>
        </LazySection>
      </main>
      <Footer />
    </div>
  );
}
