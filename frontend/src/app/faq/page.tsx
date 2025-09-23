"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Search,
  Shield,
  Clock,
  DollarSign,
  Zap
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'security' | 'fees';
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-zkbridge',
    question: 'What is ZKBridge?',
    answer: 'ZKBridge is a trustless bridge between Bitcoin and Ethereum that uses Zero-Knowledge proofs to enable secure, fast, and decentralized asset transfers. Unlike traditional bridges that rely on centralized validators, ZKBridge uses cryptographic proofs to verify transactions without requiring trust in intermediaries.',
    category: 'general',
    icon: <Zap className="h-5 w-5 text-blue-500" />
  },
  {
    id: 'how-does-it-work',
    question: 'How does the bridge work?',
    answer: 'The bridge works by creating cryptographic proofs of Bitcoin transactions using Zero-Knowledge proofs. When you want to bridge Bitcoin to Ethereum, the system generates a Merkle proof that your Bitcoin transaction is valid and included in a Bitcoin block. This proof is then verified on Ethereum, allowing you to mint equivalent tokens without trusting a central authority.',
    category: 'technical',
    icon: <Shield className="h-5 w-5 text-green-500" />
  },
  {
    id: 'is-it-secure',
    question: 'Is ZKBridge secure?',
    answer: 'Yes, ZKBridge is designed with security as the top priority. It uses Zero-Knowledge proofs and Merkle tree verification to ensure that only valid Bitcoin transactions can be bridged. The system has been audited by leading security firms, and all smart contracts are open source for community review.',
    category: 'security',
    icon: <Shield className="h-5 w-5 text-green-500" />
  },
  {
    id: 'what-are-fees',
    question: 'What are the fees?',
    answer: 'ZKBridge charges a 0.1% bridge fee plus network fees for Bitcoin and Ethereum transactions. The network fees vary based on congestion and your chosen priority level. You can use our fee calculator to estimate the total cost before bridging.',
    category: 'fees',
    icon: <DollarSign className="h-5 w-5 text-yellow-500" />
  },
  {
    id: 'how-long-does-it-take',
    question: 'How long does bridging take?',
    answer: 'Bridging time depends on network congestion and your chosen priority level. Bitcoin transactions typically take 10-60 minutes for confirmation, while Ethereum transactions take 1-5 minutes. The total bridge time is usually 15-90 minutes depending on network conditions.',
    category: 'general',
    icon: <Clock className="h-5 w-5 text-purple-500" />
  },
  {
    id: 'supported-assets',
    question: 'What assets are supported?',
    answer: 'Currently, ZKBridge supports Bitcoin (BTC) and Ethereum (ETH) on both mainnet and testnet. We plan to add support for additional assets and networks in the future. Check our Bridge Assets page for the most up-to-date list.',
    category: 'general',
    icon: <Zap className="h-5 w-5 text-blue-500" />
  },
  {
    id: 'minimum-amount',
    question: 'What is the minimum amount I can bridge?',
    answer: 'The minimum amount is 0.001 BTC or 0.01 ETH. This ensures that network fees don&apos;t exceed the bridged amount. There are also maximum limits of 10 BTC and 100 ETH per transaction to manage risk.',
    category: 'fees',
    icon: <DollarSign className="h-5 w-5 text-yellow-500" />
  },
  {
    id: 'wallet-support',
    question: 'Which wallets are supported?',
    answer: 'ZKBridge supports all standard Bitcoin and Ethereum wallets. For Bitcoin, you can use any wallet that supports standard transactions. For Ethereum, we integrate with popular wallets like MetaMask, WalletConnect, and others through our web interface.',
    category: 'technical',
    icon: <Shield className="h-5 w-5 text-green-500" />
  },
  {
    id: 'what-if-transaction-fails',
    question: 'What happens if my transaction fails?',
    answer: 'If a transaction fails due to network issues or insufficient fees, your funds remain safe in your original wallet. Failed bridge attempts are automatically refunded, and you can retry the transaction. Our support team is available to help with any issues.',
    category: 'technical',
    icon: <Shield className="h-5 w-5 text-green-500" />
  },
  {
    id: 'audit-information',
    question: 'Has the code been audited?',
    answer: 'Yes, ZKBridge has undergone comprehensive security audits by leading blockchain security firms. The audit reports are publicly available and cover both the smart contracts and the Zero-Knowledge proof implementation. We also run a bug bounty program for additional security.',
    category: 'security',
    icon: <Shield className="h-5 w-5 text-green-500" />
  },
  {
    id: 'testnet-usage',
    question: 'Can I test the bridge on testnet?',
    answer: 'Absolutely! We encourage users to test the bridge on testnet before using mainnet. You can get testnet Bitcoin from faucets and testnet Ethereum from various testnet faucets. The testnet bridge works identically to mainnet but uses testnet tokens.',
    category: 'general',
    icon: <Zap className="h-5 w-5 text-blue-500" />
  },
  {
    id: 'contact-support',
    question: 'How can I get help?',
    answer: 'You can get help through multiple channels: our documentation, FAQ, Discord community, or by contacting our support team directly. We typically respond to support requests within 24 hours. For urgent issues, please use our Discord channel.',
    category: 'general',
    icon: <HelpCircle className="h-5 w-5 text-blue-500" />
  }
];

const categories = [
  { id: 'all', label: 'All Questions', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'general', label: 'General', icon: <Zap className="h-4 w-4" /> },
  { id: 'technical', label: 'Technical', icon: <Shield className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'fees', label: 'Fees', icon: <DollarSign className="h-4 w-4" /> }
];

export default function FAQPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'FAQ' }
          ]}
          className="mb-8"
        />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about ZKBridge, bridging, security, and more.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-gray-600/50 bg-gray-800/30 text-gray-300 hover:border-gray-500/50'
                }`}
              >
                {category.icon}
                <span className="ml-2 text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-6 text-left hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4 mt-1">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white pr-4">
                        {item.question}
                      </h3>
                    </div>
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {expandedItems.has(item.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 border-t border-gray-700/50"
                  >
                    <div className="pt-6 pl-10">
                      <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No questions found</h3>
              <p className="text-gray-400">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          )}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
            <a
              href="https://discord.gg/zkbridge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Join Discord
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}