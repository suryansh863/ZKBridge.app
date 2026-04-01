
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronDown, BookOpen, Code, Zap, Shield, Globe, Users, ExternalLink, CheckCircle } from 'lucide-react'
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
    <div className="border border-border rounded-lg overflow-hidden glass-card">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="text-primary">{section.icon}</div>
          <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-background/50 border-t border-border">
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
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              ZKBridge is a trustless Bitcoin-Ethereum bridge that uses Zero-Knowledge proofs to enable
              secure cross-chain transactions without requiring trusted intermediaries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="text-foreground font-semibold mb-2">Trustless</h4>
              <p className="text-muted-foreground text-sm">No trusted intermediaries required</p>
            </div>
            <div className="glass-card p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h4 className="text-foreground font-semibold mb-2">Fast</h4>
              <p className="text-muted-foreground text-sm">Quick transaction processing</p>
            </div>
            <div className="glass-card p-6 text-center">
              <Code className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h4 className="text-foreground font-semibold mb-2">Secure</h4>
              <p className="text-muted-foreground text-sm">Cryptographically verified</p>
            </div>
          </div>

          {/* Traditional vs Trustless Comparison */}
          <div className="mt-8">
            <h4 className="text-foreground font-semibold mb-4 text-xl">Traditional vs Trustless Bridges</h4>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional Problems */}
              <div className="space-y-3">
                <h5 className="text-red-500 font-semibold mb-3">Traditional Bridges</h5>
                <div className="p-4 rounded-lg border-2 border-red-200/50 bg-red-50/50 dark:bg-red-950/20">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h6 className="font-semibold text-red-900 dark:text-red-100 text-sm">Centralized Custody</h6>
                      <p className="text-red-700 dark:text-red-300 text-xs mt-1">Hold funds in centralized wallets, creating single points of failure</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border-2 border-red-200/50 bg-red-50/50 dark:bg-red-950/20">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h6 className="font-semibold text-red-900 dark:text-red-100 text-sm">Trust Requirements</h6>
                      <p className="text-red-700 dark:text-red-300 text-xs mt-1">Must trust operators to not steal or lose funds</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZK Solutions */}
              <div className="space-y-3">
                <h5 className="text-green-500 font-semibold mb-3">BridgeSpark Solution</h5>
                <div className="p-4 rounded-lg border-2 border-green-200/50 bg-green-50/50 dark:bg-green-950/20">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h6 className="font-semibold text-green-900 dark:text-green-100 text-sm">Cryptographic Security</h6>
                      <p className="text-green-700 dark:text-green-300 text-xs mt-1">Mathematical proofs ensure validity without revealing data</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border-2 border-green-200/50 bg-green-50/50 dark:bg-green-950/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h6 className="font-semibold text-green-900 dark:text-green-100 text-sm">No Trust Required</h6>
                      <p className="text-green-700 dark:text-green-300 text-xs mt-1">Zero-knowledge proofs eliminate third-party trust</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Bridge Steps */}
          <div className="mt-8">
            <h4 className="text-foreground font-semibold mb-4 text-xl">Bridge Process (Detailed)</h4>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-foreground">Bitcoin Transaction:</strong>
                    <p className="text-sm mt-1">Send Bitcoin to a specific address. This transaction is recorded on Bitcoin's blockchain with your destination address and transaction fee.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-foreground">Transaction Verification:</strong>
                    <p className="text-sm mt-1">The system monitors Bitcoin blockchain and verifies your transaction using Merkle proofs, generating cryptographic evidence without revealing transaction details.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-foreground">SNARK Proof Generation:</strong>
                    <p className="text-sm mt-1">A Zero-Knowledge proof demonstrates knowledge of the private key and transaction details without exposing sensitive information.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <strong className="text-foreground">Ethereum Verification:</strong>
                    <p className="text-sm mt-1">The proof is submitted to the smart contract on Ethereum, which uses the SNARK verifier to confirm validity and mint equivalent ZKBTC tokens.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">5</span>
                  <div>
                    <strong className="text-foreground">Bridge Complete:</strong>
                    <p className="text-sm mt-1">Receive ZK Bridge Bitcoin (ZKBTC) tokens that can be used in DeFi protocols, traded, or bridged back to Bitcoin.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 border border-primary/20">
            <h4 className="text-foreground font-semibold mb-3 text-lg">
              💡 The Key Insight: <span className="text-primary">Mathematical Proofs</span>
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Instead of trusting a human or organization, BridgeSpark uses cryptographic proofs that can be
              mathematically verified. These proofs demonstrate that a Bitcoin transaction occurred without
              revealing any sensitive information about the transaction itself.
            </p>
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
          <div className="prose dark:prose-invert max-w-none">
            <h4 className="text-foreground font-semibold mb-3">What are ZK Proofs?</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Zero-Knowledge proofs allow one party (the prover) to prove to another party (the verifier)
              that they know a value without revealing the value itself. In the context of ZKBridge,
              ZK proofs prove that a Bitcoin transaction is valid without revealing sensitive transaction details.
            </p>

            <h4 className="text-foreground font-semibold mb-3">How ZK Proofs Work in ZKBridge</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our ZK circuit takes a Bitcoin transaction as input and generates a proof that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>The transaction exists on the Bitcoin blockchain</li>
              <li>The transaction has sufficient confirmations</li>
              <li>The transaction amount matches the claimed amount</li>
              <li>The transaction hasn&apos;t been used in a previous bridge</li>
            </ul>

            <h4 className="text-foreground font-semibold mb-3">Technical Implementation</h4>
            <div className="bg-muted rounded-lg p-4 mb-4">
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
          <div className="prose dark:prose-invert max-w-none">
            <h4 className="text-foreground font-semibold mb-3">Simplified Payment Verification (SPV)</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              SPV allows clients to verify that a transaction is included in a block without downloading
              the entire blockchain. This is achieved using Merkle trees, which provide a cryptographic
              way to prove membership in a set.
            </p>

            <h4 className="text-foreground font-semibold mb-3">Merkle Tree Structure</h4>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <pre className="text-primary text-sm overflow-x-auto">
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
            <p className="text-muted-foreground leading-relaxed mb-4">
              To prove that a transaction is included in a block, we need:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
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
          <div className="prose dark:prose-invert max-w-none">
            <h4 className="text-foreground font-semibold mb-3">Base URL</h4>
            <div className="bg-muted rounded-lg p-3 mb-4">
              <code className="text-primary">https://api.zkbridge.app</code>
            </div>

            <h4 className="text-foreground font-semibold mb-3">Authentication</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All API requests require an API key in the header:
            </p>
            <div className="bg-muted rounded-lg p-3 mb-4">
              <code className="text-green-600 dark:text-green-400">Authorization: Bearer YOUR_API_KEY</code>
            </div>

            <h4 className="text-foreground font-semibold mb-3">Endpoints</h4>

            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">POST</span>
                  <code className="text-primary">/api/bitcoin/verify</code>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Verify a Bitcoin transaction</p>
                <div className="bg-muted rounded p-3 mb-2">
                  <code className="text-green-600 dark:text-green-400 text-sm">
                    {`{
  "txid": "string",
  "address": "string",
  "amount": "number"
}`}
                  </code>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">POST</span>
                  <code className="text-primary">/api/proofs/generate</code>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Generate ZK proof for transaction</p>
                <div className="bg-muted rounded p-3 mb-2">
                  <code className="text-green-600 dark:text-green-400 text-sm">
                    {`{
  "txid": "string",
  "merkleProof": "object"
}`}
                  </code>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">POST</span>
                  <code className="text-primary">/api/bridge/initiate</code>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Initiate bridge transaction</p>
                <div className="bg-muted rounded p-3 mb-2">
                  <code className="text-green-600 dark:text-green-400 text-sm">
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
            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">How long does a bridge transaction take?</h4>
              <p className="text-muted-foreground text-sm">
                Bridge transactions typically take 10-30 minutes depending on Bitcoin network congestion
                and Ethereum gas prices. The process includes Bitcoin confirmation, ZK proof generation,
                and Ethereum transaction submission.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">What are the fees?</h4>
              <p className="text-muted-foreground text-sm">
                ZKBridge charges a 0.1% bridge fee plus network fees for Bitcoin and Ethereum transactions.
                Total fees typically range from $3-15 depending on network conditions.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">Is it safe to use?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, ZKBridge uses cryptographic proofs to ensure security. No trusted intermediaries
                are required, and all transactions are verifiable on-chain.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">What networks are supported?</h4>
              <p className="text-muted-foreground text-sm">
                Currently supports Bitcoin Testnet to Ethereum Sepolia. Mainnet support coming soon.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">Can I bridge back to Bitcoin?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, you can burn ZK Bridge Bitcoin (ZKBTC) tokens to receive Bitcoin back. The process is similar
                but in reverse - generate a proof on Ethereum and submit it to the Bitcoin side.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">What if my transaction fails?</h4>
              <p className="text-muted-foreground text-sm">
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
            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">ZK Proof</h4>
              <p className="text-muted-foreground text-sm">
                Zero-Knowledge proof - cryptographic proof that proves knowledge of information
                without revealing the information itself.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">Merkle Tree</h4>
              <p className="text-muted-foreground text-sm">
                Binary tree where each leaf node contains data and each non-leaf node contains
                the hash of its children.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">SPV</h4>
              <p className="text-muted-foreground text-sm">
                Simplified Payment Verification - method to verify transactions without
                downloading the entire blockchain.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">ZK Bridge Bitcoin (ZKBTC)</h4>
              <p className="text-muted-foreground text-sm">
                Decentralized ERC-20 token on Ethereum that represents Bitcoin. 1 ZKBTC = 1 BTC. Unlike centralized WBTC, ZKBTC is fully decentralized and trustless.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">Bridge</h4>
              <p className="text-muted-foreground text-sm">
                Connection between two different blockchains allowing asset transfers.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="text-foreground font-semibold mb-2">Trustless</h4>
              <p className="text-muted-foreground text-sm">
                System that doesn&apos;t require trusted third parties or intermediaries.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-4">
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
          <a href="#overview" className="glass-card p-4 text-center hover:bg-muted/50 transition-colors">
            <Globe className="w-6 h-6 text-primary mx-auto mb-2" />
            <h3 className="text-foreground font-medium">Overview</h3>
          </a>
          <a href="#zk-proofs" className="glass-card p-4 text-center hover:bg-muted/50 transition-colors">
            <Code className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <h3 className="text-foreground font-medium">ZK Proofs</h3>
          </a>
          <a href="#api" className="glass-card p-4 text-center hover:bg-muted/50 transition-colors">
            <Code className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <h3 className="text-foreground font-medium">API</h3>
          </a>
          <a href="#faq" className="glass-card p-4 text-center hover:bg-muted/50 transition-colors">
            <Users className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-foreground font-medium">FAQ</h3>
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
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
