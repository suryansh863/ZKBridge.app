"use client"

import { motion } from 'framer-motion';
import { Shield, Eye, Lock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrustlessExplanation() {
  const traditionalProblems = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Centralized Custody",
      description: "Traditional bridges hold your funds in centralized wallets, creating single points of failure."
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Trust Requirements",
      description: "You must trust bridge operators to not steal or lose your funds."
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Privacy Concerns",
      description: "Bridge operators can see and track all your transactions and balances."
    }
  ];

  const zkSolutions = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Cryptographic Security",
      description: "Mathematical proofs ensure transaction validity without revealing sensitive data."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "No Trust Required",
      description: "Zero-knowledge proofs eliminate the need to trust any third party."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Complete Privacy",
      description: "Prove you own Bitcoin without revealing which Bitcoin or how much."
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What Makes BridgeSpark <span className="text-primary">Trustless</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Traditional bridges require you to trust a central authority. BridgeSpark uses Zero-Knowledge proofs 
            to eliminate this trust requirement entirely.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Traditional Bridge Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 text-red-500">Traditional Bridges</h3>
              <p className="text-muted-foreground">Problems with current solutions</p>
            </div>
            
            {traditionalProblems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "p-6 rounded-xl border-2 border-red-200/50",
                  "bg-red-50/50 dark:bg-red-950/20",
                  "hover:border-red-300/70 transition-all duration-300"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                    {problem.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-red-900 dark:text-red-100">
                      {problem.title}
                    </h4>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ZK Bridge Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 text-green-500">BridgeSpark Solution</h3>
              <p className="text-muted-foreground">How Zero-Knowledge proofs solve these problems</p>
            </div>
            
            {zkSolutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "p-6 rounded-xl border-2 border-green-200/50",
                  "bg-green-50/50 dark:bg-green-950/20",
                  "hover:border-green-300/70 transition-all duration-300"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                    {solution.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">
                      {solution.title}
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      {solution.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={cn(
            "p-8 rounded-2xl text-center",
            "bg-gradient-to-br from-primary/10 via-transparent to-ethereum/10",
            "border border-primary/20"
          )}
        >
          <h3 className="text-2xl font-bold mb-4">
            The Key Insight: <span className="text-primary">Mathematical Proofs</span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Instead of trusting a human or organization, BridgeSpark uses cryptographic proofs that can be 
            mathematically verified. These proofs demonstrate that a Bitcoin transaction occurred without 
            revealing any sensitive information about the transaction itself.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

