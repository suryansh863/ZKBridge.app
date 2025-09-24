"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronDown, BookOpen, Code, Zap, Shield, Globe, Users, ExternalLink } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface DocSection {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
  subsections?: DocSection[]
}

const DocSection = ({ section, isOpen, onToggle }: { section: DocSection; isOpen: boolean; onToggle: () => void }) => {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-800/50 hover:bg-gray-800/70 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="text-blue-400">{section.icon}</div>
          <h3 className="text-lg font-semibold text-white">{section.title}</h3>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
          {section.content}
        </div>
      )}
    </div>
  )
}

export default function DocsPage() {
  const [openSections, setOpenSections] = useState<string[]>(['overview'])

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const docSections: DocSection[] = [
    {
      id: 'overview',
      title: 'How ZKBridge Works',
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed">
              ZKBridge is a trustless Bitcoin-Ethereum bridge that uses Zero-Knowledge proofs to enable 
              secure cross-chain transactions without requiring trusted intermediaries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Trustless</h4>
              <p className="text-gray-400 text-sm">No trusted intermediaries required</p>
            </div>
            <div className="glass-card p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Fast</h4>
              <p className="text-gray-400 text-sm">Quick transaction processing</p>
            </div>
            <div className="glass-card p-6 text-center">
              <Code className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Secure</h4>
              <p className="text-gray-400 text-sm">Cryptographically verified</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h4 className="text-blue-400 font-semibold mb-3">Bridge Process</h4>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                <span>Submit Bitcoin transaction for verification</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                <span>Generate Zero-Knowledge proof of transaction validity</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                <span>Submit proof to Ethereum smart contract</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
                <span>Receive ZK Bridge Bitcoin (ZKBTC) tokens on Ethereum</span>
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'zk-proofs',
      title: 'Zero-Knowledge Proofs',
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="prose prose-invert max-w-none">
            <h4 className="text-white font-semibold mb-3">What are ZK Proofs?</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              Zero-Knowledge proofs allow one party (the prover) to prove to another party (the verifier) 
              that they know a value without revealing the value itself. In the context of ZKBridge, 
              ZK proofs prove that a Bitcoin transaction is valid without revealing sensitive transaction details.
            </p>

            <h4 className="text-white font-semibold mb-3">How ZK Proofs Work in ZKBridge</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our ZK circuit takes a Bitcoin transaction as input and generates a proof that:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>The transaction exists on the Bitcoin blockchain</li>
              <li>The transaction has sufficient confirmations</li>
              <li>The transaction amount matches the claimed amount</li>
              <li>The transaction hasn&apos;t been used in a previous bridge</li>
            </ul>

            <h4 className="text-white font-semibold mb-3">Technical Implementation</h4>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`// Simplified ZK circuit for Bitcoin transaction verification
template BitcoinVerify() {
    signal input txHash;
    signal input blockHash;
    signal input merkleProof;
    signal input amount;
    signal input confirmations;
    
    // Verify Merkle proof
    component merkleVerify = MerkleVerify();
    merkleVerify.leaf <== txHash;
    merkleVerify.root <== blockHash;
    merkleVerify.path <== merkleProof;
    
    // Check minimum confirmations
    confirmations >= 6;
    
    // Verify amount is positive
    amount > 0;
}`}
              </pre>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'merkle-trees',
      title: 'Merkle Trees & SPV',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="prose prose-invert max-w-none">
            <h4 className="text-white font-semibold mb-3">Simplified Payment Verification (SPV)</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              SPV allows clients to verify that a transaction is included in a block without downloading 
              the entire blockchain. This is achieved using Merkle trees, which provide a cryptographic 
              way to prove membership in a set.
            </p>

            <h4 className="text-white font-semibold mb-3">Merkle Tree Structure</h4>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <pre className="text-blue-400 text-sm overflow-x-auto">
{`Block Header
├── Previous Block Hash
├── Merkle Root
├── Timestamp
├── Nonce
└── Difficulty Target

Merkle Tree (for transactions)
    Root (Merkle Root in header)
   /                    \\
  Hash(AB)              Hash(CD)
 /        \\            /        \\
Hash(A)   Hash(B)    Hash(C)   Hash(D)
   |         |         |         |
  TX A     TX B     TX C     TX D`}
              </pre>
            </div>

            <h4 className="text-white font-semibold mb-3">Merkle Proof Verification</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              To prove that a transaction is included in a block, we need:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>The transaction hash (leaf node)</li>
              <li>The Merkle root (from block header)</li>
              <li>The Merkle path (intermediate hashes)</li>
              <li>The position of the transaction in the tree</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Documentation',
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="prose prose-invert max-w-none">
            <h4 className="text-white font-semibold mb-3">Base URL</h4>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <code className="text-blue-400">https://api.zkbridge.app</code>
            </div>

            <h4 className="text-white font-semibold mb-3">Authentication</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              All API requests require an API key in the header:
            </p>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <code className="text-green-400">Authorization: Bearer YOUR_API_KEY</code>
            </div>

            <h4 className="text-white font-semibold mb-3">Endpoints</h4>
            
            <div className="space-y-4">
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">POST</span>
                  <code className="text-blue-400">/api/bitcoin/verify</code>
                </div>
                <p className="text-gray-300 text-sm mb-3">Verify a Bitcoin transaction</p>
                <div className="bg-gray-800 rounded p-3 mb-2">
                  <code className="text-green-400 text-sm">
{`{
  "txid": "string",
  "address": "string",
  "amount": "number"
}`}
                  </code>
                </div>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">POST</span>
                  <code className="text-blue-400">/api/proofs/generate</code>
                </div>
                <p className="text-gray-300 text-sm mb-3">Generate ZK proof for transaction</p>
                <div className="bg-gray-800 rounded p-3 mb-2">
                  <code className="text-green-400 text-sm">
{`{
  "txid": "string",
  "merkleProof": "object"
}`}
                  </code>
                </div>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">POST</span>
                  <code className="text-blue-400">/api/bridge/initiate</code>
                </div>
                <p className="text-gray-300 text-sm mb-3">Initiate bridge transaction</p>
                <div className="bg-gray-800 rounded p-3 mb-2">
                  <code className="text-green-400 text-sm">
{`{
  "proof": "string",
  "amount": "number",
  "recipient": "string"
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">How long does a bridge transaction take?</h4>
              <p className="text-gray-300 text-sm">
                Bridge transactions typically take 10-30 minutes depending on Bitcoin network congestion 
                and Ethereum gas prices. The process includes Bitcoin confirmation, ZK proof generation, 
                and Ethereum transaction submission.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">What are the fees?</h4>
              <p className="text-gray-300 text-sm">
                ZKBridge charges a 0.1% bridge fee plus network fees for Bitcoin and Ethereum transactions. 
                Total fees typically range from $3-15 depending on network conditions.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Is it safe to use?</h4>
              <p className="text-gray-300 text-sm">
                Yes, ZKBridge uses cryptographic proofs to ensure security. No trusted intermediaries 
                are required, and all transactions are verifiable on-chain.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">What networks are supported?</h4>
              <p className="text-gray-300 text-sm">
                Currently supports Bitcoin Testnet to Ethereum Sepolia. Mainnet support coming soon.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Can I bridge back to Bitcoin?</h4>
              <p className="text-gray-300 text-sm">
                Yes, you can burn ZK Bridge Bitcoin (ZKBTC) tokens to receive Bitcoin back. The process is similar 
                but in reverse - generate a proof on Ethereum and submit it to the Bitcoin side.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">What if my transaction fails?</h4>
              <p className="text-gray-300 text-sm">
                Failed transactions are automatically refunded. If you experience issues, contact our 
                support team with your transaction ID for assistance.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'glossary',
      title: 'Glossary',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">ZK Proof</h4>
              <p className="text-gray-300 text-sm">
                Zero-Knowledge proof - cryptographic proof that proves knowledge of information 
                without revealing the information itself.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Merkle Tree</h4>
              <p className="text-gray-300 text-sm">
                Binary tree where each leaf node contains data and each non-leaf node contains 
                the hash of its children.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">SPV</h4>
              <p className="text-gray-300 text-sm">
                Simplified Payment Verification - method to verify transactions without 
                downloading the entire blockchain.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">ZK Bridge Bitcoin (ZKBTC)</h4>
              <p className="text-gray-300 text-sm">
                Decentralized ERC-20 token on Ethereum that represents Bitcoin. 1 ZKBTC = 1 BTC. Unlike centralized WBTC, ZKBTC is fully decentralized and trustless.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Bridge</h4>
              <p className="text-gray-300 text-sm">
                Connection between two different blockchains allowing asset transfers.
              </p>
            </div>

            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Trustless</h4>
              <p className="text-gray-300 text-sm">
                System that doesn&apos;t require trusted third parties or intermediaries.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn how ZKBridge works, integrate with our API, and understand the technology behind trustless Bitcoin bridging
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4 mb-12"
        >
          <a href="#overview" className="glass-card p-4 text-center hover:bg-gray-800/50 transition-colors">
            <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <h3 className="text-white font-medium">Overview</h3>
          </a>
          <a href="#zk-proofs" className="glass-card p-4 text-center hover:bg-gray-800/50 transition-colors">
            <Code className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-medium">ZK Proofs</h3>
          </a>
          <a href="#api" className="glass-card p-4 text-center hover:bg-gray-800/50 transition-colors">
            <Code className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-medium">API</h3>
          </a>
          <a href="#faq" className="glass-card p-4 text-center hover:bg-gray-800/50 transition-colors">
            <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-medium">FAQ</h3>
          </a>
        </motion.div>

        {/* Documentation Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {docSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DocSection
                section={section}
                isOpen={openSections.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-8 mt-12 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-gray-300 mb-6">
            Can&apos;t find what you&apos;re looking for? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@zkbridge.app"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
            <a
              href="https://github.com/zkbridge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
