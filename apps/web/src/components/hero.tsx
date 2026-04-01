
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, Lock, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Hero() {
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  useEffect(() => {
    // Enable animations after a short delay to improve initial load performance
    const timer = setTimeout(() => {
      setAnimationsEnabled(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative py-12 md:py-20 px-4 overflow-hidden bg-background">
      {/* Lightweight CSS-only Animated Background */}
      <div className="hero-bg-animation">
        {/* Connection nodes (dots) */}
        <div className="hero-node hero-node-1" />
        <div className="hero-node hero-node-2" />
        <div className="hero-node hero-node-3" />
        <div className="hero-node hero-node-4" />
        <div className="hero-node hero-node-5" />
        <div className="hero-node hero-node-6" />
        <div className="hero-node hero-node-7" />
        <div className="hero-node hero-node-8" />
        <div className="hero-node hero-node-9" />
        <div className="hero-node hero-node-10" />

        {/* Connection lines */}
        <div className="hero-line hero-line-1" />
        <div className="hero-line hero-line-2" />
        <div className="hero-line hero-line-3" />
        <div className="hero-line hero-line-4" />
        <div className="hero-line hero-line-5" />
        <div className="hero-line hero-line-6" />
      </div>

      <div className="container mx-auto text-center relative z-10 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full",
              "glass-card border border-border/20",
              "text-xs md:text-sm font-medium text-muted-foreground"
            )}>
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              <span>Powered by Zero-Knowledge Proofs</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-7xl font-bold mb-6 leading-tight"
          >

            <motion.span
              className="bg-gradient-to-r from-bitcoin via-primary to-ethereum bg-clip-text text-transparent"
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
            >
              Trustless Bridge
            </motion.span>
            <br />
            <motion.span
              className="text-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Bitcoin ↔ Ethereum
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Bridge your assets between Bitcoin and Ethereum using cryptographic proofs.
            <span className="text-foreground font-medium"> Secure, fast, and completely trustless.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                to="/bridge"
                className={cn(
                  "group relative z-10 px-8 py-4 rounded-xl font-semibold text-lg",
                  "inline-flex items-center justify-center min-w-[200px]",
                  "bg-gradient-to-r from-primary to-primary/80 text-white",
                  "hover:from-primary/90 hover:to-primary/70 transition-all duration-300",
                  "shadow-lg hover:shadow-xl",
                  "crypto-glow overflow-hidden"
                )}
              >
                {/* Background Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"
                  animate={{
                    left: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5
                  }}
                  style={{ width: '100%' }}
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Bridge Demo
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/docs"
                className={cn(
                  "group relative px-8 py-4 rounded-xl font-semibold text-lg",
                  "inline-flex items-center justify-center min-w-[200px]",
                  "glass-card border border-border text-foreground shadow-sm",
                  "hover:bg-accent hover:shadow-md transition-all duration-300"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  Learn How It Works
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Eye className="h-5 w-5" />
                  </motion.div>
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              whileHover={{ y: -5 }}
              className={cn(
                "group flex flex-col items-center p-8 rounded-2xl",
                "glass-card border border-border/20",
                "hover:border-primary/30 transition-all duration-300",
                "interactive"
              )}
            >
              <motion.div
                className={cn(
                  "p-4 rounded-2xl mb-6 transition-all duration-300",
                  "bg-gradient-to-br from-bitcoin/20 to-bitcoin/10",
                  "group-hover:scale-110 group-hover:rotate-3"
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(247, 147, 26, 0.4)",
                    "0 0 20px 10px rgba(247, 147, 26, 0.1)",
                    "0 0 0 0 rgba(247, 147, 26, 0.4)"
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Shield className="h-8 w-8 text-bitcoin" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Zero-Knowledge Security</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Cryptographic proofs secure your transactions without revealing sensitive data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              whileHover={{ y: -5 }}
              className={cn(
                "group flex flex-col items-center p-8 rounded-2xl",
                "glass-card border border-border/20",
                "hover:border-primary/30 transition-all duration-300",
                "interactive"
              )}
            >
              <motion.div
                className={cn(
                  "p-4 rounded-2xl mb-6 transition-all duration-300",
                  "bg-gradient-to-br from-ethereum/20 to-ethereum/10",
                  "group-hover:scale-110 group-hover:rotate-3"
                )}
                whileHover={{ scale: 1.1, rotate: -5 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(98, 126, 234, 0.4)",
                    "0 0 20px 10px rgba(98, 126, 234, 0.1)",
                    "0 0 0 0 rgba(98, 126, 234, 0.4)"
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Zap className="h-8 w-8 text-ethereum" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Bridge your assets in minutes, not hours. Optimized for speed and efficiency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{ y: -5 }}
              className={cn(
                "group flex flex-col items-center p-8 rounded-2xl",
                "glass-card border border-white/20",
                "hover:border-white/30 transition-all duration-300",
                "interactive"
              )}
            >
              <motion.div
                className={cn(
                  "p-4 rounded-2xl mb-6 transition-all duration-300",
                  "bg-gradient-to-br from-primary/20 to-primary/10",
                  "group-hover:scale-110 group-hover:rotate-3"
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(99, 102, 241, 0.4)",
                    "0 0 20px 10px rgba(99, 102, 241, 0.1)",
                    "0 0 0 0 rgba(99, 102, 241, 0.4)"
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: {
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    },
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <Globe className="h-8 w-8 text-primary" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Decentralized</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                No central authority. Your funds are always under your control.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
