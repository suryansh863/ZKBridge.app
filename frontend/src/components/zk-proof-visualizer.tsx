"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  CheckCircle, 
  Shield, 
  Key, 
  Zap,
  Info,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZKProofVisualizerProps {
  className?: string;
}

export function ZKProofVisualizer({ className }: ZKProofVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [secret, setSecret] = useState('my-secret-data');
  const [proof, setProof] = useState<string | null>(null);

  const steps = [
    {
      title: 'Secret Input',
      description: 'User provides secret data (private input)',
      icon: Lock,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Circuit Execution',
      description: 'ZK circuit processes the secret without revealing it',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Proof Generation',
      description: 'Mathematical proof is generated using cryptography',
      icon: Key,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Verification',
      description: 'Proof is verified without revealing the secret',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ];

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProof(null);
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          setProof('zk-proof-abc123...');
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProof(null);
  };

  return (
    <section className={cn("py-20 px-4", className)}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Zero-Knowledge Proof Visualization
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn how ZK proofs work in our bridge by seeing the cryptographic process in action.
            Your secrets stay private while proving their validity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "relative p-8 rounded-3xl",
              "glass-card border border-white/20",
              "shadow-2xl"
            )}
          >
            {/* Demo Controls */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold">Interactive Demo</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : startDemo}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300",
                    "glass border border-white/20",
                    "hover:scale-105 interactive"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={resetDemo}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300",
                    "glass border border-white/20",
                    "hover:scale-105 interactive"
                  )}
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Secret Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Secret Input</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className={cn(
                  "w-full p-3 rounded-xl font-mono text-sm",
                  "glass border border-white/10",
                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                )}
                placeholder="Enter your secret..."
              />
            </div>

            {/* Steps Visualization */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl transition-all duration-500",
                      "glass border",
                      isActive && "border-primary/50 bg-primary/5",
                      isCompleted && "border-green-500/50 bg-green-500/5",
                      !isActive && !isCompleted && "border-white/10"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      step.bgColor,
                      step.borderColor,
                      "border",
                      isActive && "scale-110 animate-pulse",
                      isCompleted && "bg-green-500/20 border-green-500/50"
                    )}>
                      <Icon className={cn(
                        "h-6 w-6 transition-colors duration-300",
                        isCompleted ? "text-green-500" : step.color
                      )} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    <div className={cn(
                      "transition-all duration-300",
                      isCompleted && "text-green-500"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </motion.div>
                      ) : (
                        <div className="h-6 w-6 border-2 border-muted-foreground/30 rounded-full" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Proof Output */}
            <AnimatePresence>
              {proof && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "mt-6 p-4 rounded-2xl",
                    "glass border border-green-500/20",
                    "bg-green-500/5"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-500">ZK Proof Generated</span>
                  </div>
                  <div className="font-mono text-sm text-foreground/80 break-all">
                    {proof}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This proof verifies knowledge of the secret without revealing it
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Educational Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className={cn(
              "p-6 rounded-2xl",
              "glass-card border border-white/20"
            )}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                What are ZK Proofs?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Zero-Knowledge proofs allow you to prove you know a secret without revealing the secret itself. 
                In our bridge, this means proving you own Bitcoin without exposing your private keys.
              </p>
            </div>

            <div className={cn(
              "p-6 rounded-2xl",
              "glass-card border border-white/20"
            )}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                Privacy Benefits
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Your private keys never leave your device</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Transaction amounts can be hidden</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No need to trust centralized validators</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Mathematically provable security</span>
                </li>
              </ul>
            </div>

            <div className={cn(
              "p-6 rounded-2xl",
              "glass-card border border-white/20"
            )}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                How It Works in Our Bridge
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">1. Bitcoin Transaction:</span> 
                  You create a Bitcoin transaction with your secret data.
                </p>
                <p>
                  <span className="font-semibold text-foreground">2. Proof Generation:</span> 
                  Our ZK circuit generates a proof that you own the Bitcoin without revealing your private key.
                </p>
                <p>
                  <span className="font-semibold text-foreground">3. Ethereum Verification:</span> 
                  The Ethereum smart contract verifies the proof and releases your bridged assets.
                </p>
                <p>
                  <span className="font-semibold text-foreground">4. Trustless Bridge:</span> 
                  No centralized authority can steal your funds or censor your transactions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

