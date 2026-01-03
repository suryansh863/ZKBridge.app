"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <section className="relative py-12 md:py-20 px-4 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-bitcoin/5 via-transparent to-ethereum/5" />

      {/* Optimized floating orbs - only animate when enabled */}
      {animationsEnabled && (
        <>
          <motion.div
            className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-bitcoin/10 rounded-full blur-3xl"
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
            className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-ethereum/10 rounded-full blur-3xl"
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

          {/* Additional floating particles */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/20 rounded-full hidden md:block"
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-6 h-6 bg-bitcoin/30 rounded-full hidden md:block"
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-ethereum/40 rounded-full hidden md:block"
            initial={{ opacity: 0 }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </>
      )}

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
              "glass-card border border-white/20",
              "text-xs md:text-sm font-medium text-foreground/80"
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
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl blur-lg opacity-75"
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
              <Link
                href="/bridge"
                className={cn(
                  "group relative px-8 py-4 rounded-xl font-semibold text-lg",
                  "bg-gradient-to-r from-primary to-primary/80 text-white",
                  "hover:from-primary/90 hover:to-primary/70 transition-all duration-300",
                  "shadow-lg hover:shadow-xl",
                  "crypto-glow"
                )}
              >
                <span className="flex items-center justify-center gap-2">
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
                href="/docs"
                className={cn(
                  "group relative px-8 py-4 rounded-xl font-semibold text-lg",
                  "glass-card border border-white/20 text-foreground",
                  "hover:bg-white/5 transition-all duration-300"
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
                "glass-card border border-white/20",
                "hover:border-white/30 transition-all duration-300",
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
                "glass-card border border-white/20",
                "hover:border-white/30 transition-all duration-300",
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
