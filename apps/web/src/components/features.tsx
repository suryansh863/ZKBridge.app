"use client"

import { CheckCircle, ArrowRightLeft, Lock, Eye, Clock, DollarSign } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <ArrowRightLeft className="h-6 w-6" />,
      title: "Bidirectional Bridge",
      description: "Seamlessly move assets between Bitcoin and Ethereum networks in both directions."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Merkle Proof Verification",
      description: "Cryptographically verify Bitcoin transactions using Merkle proofs for maximum security."
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "ZK Proof Privacy",
      description: "Prove transaction validity without revealing sensitive information using Zero-Knowledge proofs."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Tracking",
      description: "Monitor your bridge transactions in real-time with detailed status updates."
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Low Fees",
      description: "Minimize costs with optimized transaction batching and efficient proof generation."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Audited & Secure",
      description: "Built with security-first principles and audited by leading blockchain security firms."
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose ZKBridge?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of cross-chain bridging with cutting-edge cryptography and user-friendly design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Technical specs */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg bg-card border">
            <h3 className="text-xl font-semibold mb-4">Bitcoin Integration</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Full Bitcoin transaction verification</li>
              <li>• Merkle proof generation and validation</li>
              <li>• Support for Bitcoin testnet and mainnet</li>
              <li>• UTXO tracking and management</li>
            </ul>
          </div>

          <div className="p-8 rounded-lg bg-card border">
            <h3 className="text-xl font-semibold mb-4">Ethereum Integration</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Smart contract interaction</li>
              <li>• Gas optimization</li>
              <li>• Multi-network support (Ethereum, Sepolia)</li>
              <li>• ERC-20 token compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

