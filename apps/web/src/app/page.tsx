"use client"

import { Suspense, lazy } from 'react';
import Link from 'next/link';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LazySection } from '@/components/lazy-section';
import { HowItWorks } from '@/components/how-it-works';
import { TrustlessExplanation } from '@/components/trustless-explanation';

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
        <TrustlessExplanation />
        <HowItWorks />
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

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-transparent to-ethereum/5">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Trustless Bridging?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Try our demo with Bitcoin testnet transactions and see how SNARKs make cross-chain bridging secure and private.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/bridge"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Bridge Demo
              </Link>
              <Link 
                href="/docs"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg glass-card border border-white/20 text-foreground hover:bg-white/5 transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
