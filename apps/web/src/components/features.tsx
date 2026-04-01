
import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRightLeft, Lock, Eye, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Features() {
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  useEffect(() => {
    // Enable animations after a short delay to improve initial load performance
    const timer = setTimeout(() => {
      setAnimationsEnabled(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
      title: "Null Platform Fees",
      description: "Experience 100% free bridging with zero platform charges. Only standard network gas applies."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Audited & Secure",
      description: "Built with security-first principles and audited by leading blockchain security firms."
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
      {/* Optimized background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-ethereum/5" />
      {animationsEnabled && (
        <>
          <motion.div 
            className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
            initial={{ opacity: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-40 h-40 bg-ethereum/10 rounded-full blur-2xl"
            initial={{ opacity: 0 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, -25, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </>
      )}
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Why Choose <span className="bg-gradient-to-r from-primary to-ethereum bg-clip-text text-transparent">BridgeSpark</span>?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Experience the future of cross-chain bridging with cutting-edge cryptography and user-friendly design.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                "p-6 rounded-lg bg-card border transition-all duration-300",
                "hover:shadow-lg hover:shadow-primary/10",
                "hover:border-primary/20 cursor-pointer"
              )}
            >
              <motion.div 
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="p-2 rounded-lg bg-primary/10 text-primary mr-3"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    backgroundColor: "rgba(99, 102, 241, 0.2)"
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(99, 102, 241, 0.4)",
                      "0 0 10px 5px rgba(99, 102, 241, 0.1)",
                      "0 0 0 0 rgba(99, 102, 241, 0.4)"
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
                    animate={{ 
                      rotate: [0, 5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                </motion.div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </motion.div>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                {feature.description}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* Technical specs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.div 
            className="p-8 rounded-lg bg-card border hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h3 
              className="text-xl font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-bitcoin to-bitcoin/80 bg-clip-text text-transparent">
                Bitcoin Integration
              </span>
            </motion.h3>
            <motion.ul 
              className="space-y-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                "Full Bitcoin transaction verification",
                "Merkle proof generation and validation", 
                "Support for Bitcoin testnet and mainnet",
                "UTXO tracking and management"
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <motion.span 
                    className="text-bitcoin mr-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    •
                  </motion.span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div 
            className="p-8 rounded-lg bg-card border hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.h3 
              className="text-xl font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-ethereum to-ethereum/80 bg-clip-text text-transparent">
                Ethereum Integration
              </span>
            </motion.h3>
            <motion.ul 
              className="space-y-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                "Smart contract interaction",
                "Gas optimization",
                "Multi-network support (Ethereum, Sepolia)",
                "ERC-20 token compatibility"
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <motion.span 
                    className="text-ethereum mr-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    •
                  </motion.span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

