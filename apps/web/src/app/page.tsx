"use client"

import { Suspense, lazy, useState, useEffect } from 'react';
import Link from 'next/link';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LazySection } from '@/components/lazy-section';
import { HowItWorks } from '@/components/how-it-works';
import { TrustlessExplanation } from '@/components/trustless-explanation';

// Lazy load heavy components with better error handling
const BridgeInterface = lazy(() => 
  import('@/components/bridge-interface')
    .then(module => ({ default: module.BridgeInterface }))
    .catch(() => ({ default: () => <div className="p-8 text-center text-muted-foreground">Bridge interface temporarily unavailable</div> }))
);

const ZKProofVisualizer = lazy(() => 
  import('@/components/zk-proof-visualizer')
    .then(module => ({ default: module.ZKProofVisualizer }))
    .catch(() => ({ default: () => <div className="p-8 text-center text-muted-foreground">ZK Proof visualizer temporarily unavailable</div> }))
);

const TransactionHistory = lazy(() => 
  import('@/components/transaction-history')
    .then(module => ({ default: module.TransactionHistory }))
    .catch(() => ({ default: () => <div className="p-8 text-center text-muted-foreground">Transaction history temporarily unavailable</div> }))
);

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure the page is fully loaded before showing content
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading BridgeSpark...</p>
        </div>
      </div>
    );
  }

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
          <Suspense fallback={<LoadingSpinner />}>
            <BridgeInterface />
          </Suspense>
        </LazySection>
        
        <LazySection>
          <Suspense fallback={<LoadingSpinner />}>
            <ZKProofVisualizer />
          </Suspense>
        </LazySection>
        
        <LazySection>
          <Suspense fallback={<LoadingSpinner />}>
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
