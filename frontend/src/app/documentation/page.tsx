"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Code, 
  Shield, 
  Zap, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

interface DocumentationSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: {
    overview: string;
    features: string[];
    codeExample?: string;
    links: { label: string; href: string; external?: boolean }[];
  };
}

const documentationSections: DocumentationSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guide for developers and users',
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    content: {
      overview: 'Learn how to integrate ZKBridge into your application or start bridging assets as a user.',
      features: [
        'Installation and setup',
        'Basic configuration',
        'First bridge transaction',
        'Wallet integration',
        'Error handling'
      ],
      codeExample: `// Install the ZKBridge SDK
npm install @zkbridge/sdk

// Initialize the bridge
import { ZKBridge } from '@zkbridge/sdk';

const bridge = new ZKBridge({
  network: 'testnet',
  apiKey: 'your-api-key'
});

// Bridge Bitcoin to Ethereum
const result = await bridge.bridge({
  from: 'bitcoin',
  to: 'ethereum',
  amount: '0.001',
  recipient: '0x...'
});`,
      links: [
        { label: 'Installation Guide', href: '/docs/installation' },
        { label: 'Quick Start Tutorial', href: '/docs/quick-start' },
        { label: 'Configuration Reference', href: '/docs/configuration' }
      ]
    }
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Complete API documentation and endpoints',
    icon: <Code className="h-6 w-6 text-blue-500" />,
    content: {
      overview: 'Comprehensive reference for all ZKBridge API endpoints, authentication, and response formats.',
      features: [
        'RESTful API endpoints',
        'Authentication methods',
        'Request/response schemas',
        'Rate limiting',
        'Error codes and handling'
      ],
      codeExample: `// Get transaction status
GET /api/bitcoin/transaction/{txid}

// Response
{
  "success": true,
  "data": {
    "txid": "abc123...",
    "amount": 0.001,
    "confirmations": 6,
    "status": "confirmed"
  }
}`,
      links: [
        { label: 'API Endpoints', href: '/api' },
        { label: 'Authentication', href: '/docs/auth' },
        { label: 'Rate Limits', href: '/docs/rate-limits' }
      ]
    }
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Security model and best practices',
    icon: <Shield className="h-6 w-6 text-green-500" />,
    content: {
      overview: 'Understanding ZKBridge security model, cryptographic guarantees, and security best practices.',
      features: [
        'Zero-Knowledge proof verification',
        'Merkle tree validation',
        'Cryptographic signatures',
        'Secure key management',
        'Audit reports and bug bounty'
      ],
      links: [
        { label: 'Security Model', href: '/security' },
        { label: 'Audit Reports', href: '/audit' },
        { label: 'Bug Bounty Program', href: '/docs/bug-bounty' }
      ]
    }
  }
];

export default function DocumentationPage() {
  const [mounted, setMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const copyCode = async (code: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(sectionId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

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
            { label: 'Documentation' }
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
            Documentation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete technical documentation for developers, integrators, and users of the ZKBridge protocol.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <a
            href="/api"
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <Code className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">API Reference</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Complete REST API documentation with interactive examples
            </p>
            <div className="flex items-center text-blue-400 group-hover:text-blue-300">
              <span className="text-sm font-medium">View API Docs</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </a>

          <a
            href="/guides"
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <Book className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">User Guides</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Step-by-step tutorials for bridging and wallet integration
            </p>
            <div className="flex items-center text-green-400 group-hover:text-green-300">
              <span className="text-sm font-medium">View Guides</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </a>

          <a
            href="/security"
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">Security</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Security model, audits, and best practices
            </p>
            <div className="flex items-center text-purple-400 group-hover:text-purple-300">
              <span className="text-sm font-medium">View Security</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </a>
        </motion.div>

        {/* Documentation Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {documentationSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {section.icon}
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                      <p className="text-gray-400 text-sm">{section.description}</p>
                    </div>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-6 border-t border-gray-700/50"
                >
                  <div className="pt-6">
                    <p className="text-gray-300 mb-6">{section.content.overview}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Features */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Key Features</h4>
                        <ul className="space-y-2">
                          {section.content.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Links */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Related Resources</h4>
                        <div className="space-y-3">
                          {section.content.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.href}
                              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors group"
                            >
                              <span className="text-sm font-medium">{link.label}</span>
                              {link.external ? (
                                <ExternalLink className="h-3 w-3 ml-2" />
                              ) : (
                                <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Code Example */}
                    {section.content.codeExample && (
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">Code Example</h4>
                          <button
                            onClick={() => copyCode(section.content.codeExample!, section.id)}
                            className="flex items-center px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                          >
                            {copiedCode === section.id ? (
                              <>
                                <Check className="h-4 w-4 text-green-400 mr-2" />
                                <span className="text-green-400 text-sm">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-400 text-sm">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
                          <code className="text-gray-300 text-sm">{section.content.codeExample}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Additional Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="/faq"
              className="text-center group"
            >
              <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Book className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">FAQ</h3>
              <p className="text-gray-400 text-sm">Common questions and answers</p>
            </a>
            
            <a
              href="/contact"
              className="text-center group"
            >
              <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <p className="text-gray-400 text-sm">Get help from our team</p>
            </a>
            
            <a
              href="https://github.com/zkbridge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center group"
            >
              <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">GitHub</h3>
              <p className="text-gray-400 text-sm">Source code and issues</p>
            </a>
            
            <a
              href="https://discord.gg/zkbridge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center group"
            >
              <div className="bg-pink-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-400 text-sm">Join our Discord</p>
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
