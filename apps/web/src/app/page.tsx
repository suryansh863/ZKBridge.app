"use client"

import { Suspense, lazy, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LazySection } from '@/components/lazy-section';
import { HowItWorks } from '@/components/how-it-works';
import { TrustlessExplanation } from '@/components/trustless-explanation';
import { Preloader } from '@/components/preloader';

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
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Check if page was already loaded (for subsequent visits)
    const wasLoaded = sessionStorage.getItem('bridgeSparkLoaded');
    if (wasLoaded) {
      setShowPreloader(false);
      setIsLoaded(true);
      setAnimationsEnabled(true);
      return;
    }

    // Mark as loaded for future visits
    sessionStorage.setItem('bridgeSparkLoaded', 'true');
  }, []);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    setIsLoaded(true);
    
    // Enable animations after preloader
    setTimeout(() => {
      setAnimationsEnabled(true);
    }, 100);
  };

  if (showPreloader) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
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

        {/* Enhanced Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-transparent to-ethereum/5 relative overflow-hidden">
          {/* Optimized background elements - only animate when enabled */}
          {animationsEnabled && (
            <>
              <motion.div 
                className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
                initial={{ opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                  x: [0, 50, 0],
                  y: [0, -30, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute bottom-0 right-1/4 w-80 h-80 bg-ethereum/10 rounded-full blur-3xl"
                initial={{ opacity: 0 }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.5, 0.2],
                  x: [0, -40, 0],
                  y: [0, 40, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
            </>
          )}
          
          <div className="container mx-auto text-center relative z-10">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
                className="bg-gradient-to-r from-primary via-ethereum to-primary bg-clip-text text-transparent"
              >
                Ready to Experience Trustless Bridging?
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Try our demo with Bitcoin testnet transactions and see how SNARKs make cross-chain bridging secure and private.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                {animationsEnabled && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl blur-lg opacity-75"
                    initial={{ opacity: 0 }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                <Link 
                  href="/bridge"
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {animationsEnabled ? (
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Start Bridge Demo
                    </motion.span>
                  ) : (
                    "Start Bridge Demo"
                  )}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/docs"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg glass-card border border-white/20 text-foreground hover:bg-white/5 transition-all duration-300"
                >
                  {animationsEnabled ? (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Learn More
                    </motion.span>
                  ) : (
                    "Learn More"
                  )}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
