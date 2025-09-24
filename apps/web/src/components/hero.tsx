"use client"

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Lock, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-bitcoin/5 via-transparent to-ethereum/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-bitcoin/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-ethereum/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto text-center relative z-10">
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
              "text-sm font-medium text-foreground/80"
            )}>
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Powered by Zero-Knowledge Proofs</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-bitcoin via-primary to-ethereum bg-clip-text text-transparent">
              Trustless Bridge
            </span>
            <br />
            <span className="text-foreground">Bitcoin ↔ Ethereum</span>
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
            <Link 
              href="/bridge"
              className={cn(
                "group relative px-8 py-4 rounded-xl font-semibold text-lg",
                "bg-gradient-to-r from-primary to-primary/80 text-white",
                "hover:from-primary/90 hover:to-primary/70 transition-all duration-300",
                "shadow-lg hover:shadow-xl hover:scale-105",
                "crypto-glow"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                Start Bridge Demo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              href="/docs"
              className={cn(
                "group relative px-8 py-4 rounded-xl font-semibold text-lg",
                "glass-card border border-white/20 text-foreground",
                "hover:bg-white/5 transition-all duration-300",
                "hover:scale-105"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                Learn How It Works
                <Eye className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </span>
            </Link>
          </motion.div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className={cn(
                "group flex flex-col items-center p-8 rounded-2xl",
                "glass-card border border-white/20",
                "hover:border-white/30 transition-all duration-300",
                "hover:scale-105 interactive"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl mb-6 transition-all duration-300",
                "bg-gradient-to-br from-bitcoin/20 to-bitcoin/10",
                "group-hover:scale-110 group-hover:rotate-3"
              )}>
                <Shield className="h-8 w-8 text-bitcoin" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Zero-Knowledge Security</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Cryptographic proofs secure your transactions without revealing sensitive data.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className={cn(
                "group flex flex-col items-center p-8 rounded-2xl",
                "glass-card border border-white/20",
                "hover:border-white/30 transition-all duration-300",
                "hover:scale-105 interactive"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl mb-6 transition-all duration-300",
                "bg-gradient-to-br from-ethereum/20 to-ethereum/10",
                "group-hover:scale-110 group-hover:rotate-3"
              )}>
                <Zap className="h-8 w-8 text-ethereum" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Bridge your assets in minutes, not hours. Optimized for speed and efficiency.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className={cn(
                "group flex flex-col items-center p-8 rounded-2xl",
                "glass-card border border-white/20",
                "hover:border-white/30 transition-all duration-300",
                "hover:scale-105 interactive"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl mb-6 transition-all duration-300",
                "bg-gradient-to-br from-primary/20 to-primary/10",
                "group-hover:scale-110 group-hover:rotate-3"
              )}>
                <Globe className="h-8 w-8 text-primary" />
              </div>
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
