"use client"

import { motion } from 'framer-motion';
import { ArrowRight, Bitcoin, Zap, Shield, CheckCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HowItWorks() {
  const steps = [
    {
      step: 1,
      icon: <Bitcoin className="h-8 w-8" />,
      title: "Bitcoin Transaction",
      description: "You send Bitcoin to a specific address on the Bitcoin network. This transaction is recorded on the Bitcoin blockchain.",
      details: "The transaction includes your Bitcoin, destination address, and transaction fee. This creates a permanent record on Bitcoin's blockchain."
    },
    {
      step: 2,
      icon: <Eye className="h-8 w-8" />,
      title: "Transaction Verification",
      description: "Our system monitors the Bitcoin blockchain and verifies your transaction using Merkle proofs.",
      details: "We generate a cryptographic proof that your transaction exists in a specific Bitcoin block without revealing the transaction details."
    },
    {
      step: 3,
      icon: <Zap className="h-8 w-8" />,
      title: "SNARK Proof Generation",
      description: "A Zero-Knowledge proof is generated that proves you own the Bitcoin without revealing which Bitcoin.",
      details: "This SNARK proof demonstrates knowledge of the private key and transaction details without exposing sensitive information."
    },
    {
      step: 4,
      icon: <Shield className="h-8 w-8" />,
      title: "Ethereum Verification",
      description: "The proof is submitted to our smart contract on Ethereum, which verifies the proof and mints ZK Bridge Bitcoin (ZKBTC).",
      details: "The smart contract uses the SNARK verifier to confirm the proof is valid, then mints equivalent ZKBTC tokens that represent your Bitcoin."
    },
    {
      step: 5,
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Bridge Complete",
      description: "You receive ZK Bridge Bitcoin (ZKBTC) on Ethereum that represents your original Bitcoin.",
      details: "ZKBTC is a decentralized token that can be used in DeFi protocols, traded, or bridged back to Bitcoin using the reverse process."
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            How <span className="text-primary">ZKBridge</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A step-by-step breakdown of the trustless bridging process using Zero-Knowledge proofs
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-primary/50 to-primary/20 z-0" />
              )}

              <div className="flex gap-8 items-start mb-12">
                {/* Step Number and Icon */}
                <div className="flex-shrink-0 relative z-10">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-primary/80 text-white",
                    "shadow-lg border-4 border-background"
                  )}>
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        {step.icon}
                      </div>
                      <div className="text-xs font-bold">
                        {step.step}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    className={cn(
                      "p-6 rounded-xl",
                      "bg-card border border-border/50",
                      "hover:border-primary/30 transition-all duration-300",
                      "hover:shadow-lg"
                    )}
                  >
                    <h3 className="text-xl font-bold mb-3 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {step.description}
                    </p>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                      <p className="text-sm text-muted-foreground">
                        <strong>Technical Details:</strong> {step.details}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6 rounded-xl bg-card border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Cryptographically Secure</h3>
            <p className="text-sm text-muted-foreground">
              Mathematical proofs ensure no one can fake or manipulate the bridging process.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Privacy Preserving</h3>
            <p className="text-sm text-muted-foreground">
              Your transaction details remain private while still being verifiable.
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Trustless</h3>
            <p className="text-sm text-muted-foreground">
              No need to trust any central authority - the math does the verification.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

