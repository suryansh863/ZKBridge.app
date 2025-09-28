/**
 *  Guide Component
 * Provides step-by-step guides for different  types
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Download,
  Smartphone,
  Monitor,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Info, Guide as GuideType } from '@/types/';

interface GuideProps {
  : Info;
  isOpen: boolean;
  onClose: () => void;
}

export function Guide({ , isOpen, onClose }: GuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const guide = getGuide(.type);

  const nextStep = () => {
    if (currentStep < guide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {.icon ? (
                  <img src={.icon} alt={.name} className="w-8 h-8" />
                ) : (
                  <Shield className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{.name} Setup Guide</h2>
                <p className="text-sm text-gray-400">Step-by-step installation and connection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {guide.steps.length}
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(((currentStep + 1) / guide.steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / guide.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                {guide.steps[currentStep].title}
              </h3>
              <p className="text-gray-300">
                {guide.steps[currentStep].description}
              </p>
            </div>

            {/* Step Image/Video */}
            {guide.steps[currentStep].image && (
              <div className="mb-6">
                <img 
                  src={guide.steps[currentStep].image} 
                  alt={guide.steps[currentStep].title}
                  className="w-full rounded-lg border border-gray-700"
                />
              </div>
            )}

            {/* Tips */}
            {guide.tips.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {guide.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Troubleshooting */}
            {guide.troubleshooting.length > 0 && currentStep === guide.steps.length - 1 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Troubleshooting
                </h4>
                <div className="space-y-3">
                  {guide.troubleshooting.map((item, index) => (
                    <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-400 mb-1">
                        {item.problem}
                      </p>
                      <p className="text-sm text-gray-300">
                        {item.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {.downloadUrl && (
                <a
                  href={.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
              {.guideUrl && (
                <a
                  href={.guideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Full Guide
                </a>
              )}
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === guide.steps.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === guide.steps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get  guide based on  type
 */
function getGuide(Type: string): GuideType {
  const guides: Record<string, GuideType> = {
    metamask: {
      Id: 'metamask',
      title: 'MetaMask Setup Guide',
      steps: [
        {
          title: 'Install MetaMask Extension',
          description: 'Visit the Chrome Web Store or Firefox Add-ons and install the MetaMask extension.',
          image: '/guides/metamask/install.png'
        },
        {
          title: 'Create a New ',
          description: 'Click "Create a new " and follow the setup process. Make sure to save your seed phrase securely.',
          image: '/guides/metamask/create.png'
        },
        {
          title: 'Connect to BridgeSpark',
          description: 'Click the "Connect " button on BridgeSpark and select MetaMask from the list.',
          image: '/guides/metamask/connect.png'
        },
        {
          title: 'Approve Connection',
          description: 'In the MetaMask popup, click "Connect" to approve the connection to BridgeSpark.',
          image: '/guides/metamask/approve.png'
        }
      ],
      tips: [
        'Never share your seed phrase with anyone',
        'Always verify you\'re on the correct website',
        'Keep your MetaMask extension updated',
        'Use hardware s for large amounts'
      ],
      troubleshooting: [
        {
          problem: 'MetaMask popup not appearing',
          solution: 'Check if popups are blocked in your browser settings and allow them for this site.'
        },
        {
          problem: 'Transaction stuck or pending',
          solution: 'Try increasing the gas limit or gas price in MetaMask, or cancel and retry the transaction.'
        },
        {
          problem: 'Wrong network selected',
          solution: 'Click on the network name in MetaMask and switch to the correct network (Ethereum Mainnet).'
        }
      ]
    },
    coinbase: {
      Id: 'coinbase',
      title: 'Coinbase  Setup Guide',
      steps: [
        {
          title: 'Install Coinbase ',
          description: 'Download Coinbase  from the Chrome Web Store or your mobile app store.',
          image: '/guides/coinbase/install.png'
        },
        {
          title: 'Set Up Your ',
          description: 'Create a new  or import an existing one using your seed phrase.',
          image: '/guides/coinbase/setup.png'
        },
        {
          title: 'Connect to BridgeSpark',
          description: 'Click "Connect " and select Coinbase  from the options.',
          image: '/guides/coinbase/connect.png'
        },
        {
          title: 'Authorize Connection',
          description: 'Approve the connection request in your Coinbase .',
          image: '/guides/coinbase/authorize.png'
        }
      ],
      tips: [
        'Coinbase  supports multiple networks',
        'You can connect both mobile and browser versions',
        'Keep your recovery phrase safe and offline',
        'Enable biometric authentication for security'
      ],
      troubleshooting: [
        {
          problem: 'Connection request not received',
          solution: 'Make sure you have the latest version of Coinbase  installed and try refreshing the page.'
        },
        {
          problem: 'Transaction failed',
          solution: 'Check your account balance and ensure you have enough ETH for gas fees.'
        }
      ]
    },
    trust: {
      Id: 'trust',
      title: 'Trust  Setup Guide',
      steps: [
        {
          title: 'Download Trust ',
          description: 'Install Trust  from the App Store (iOS) or Google Play Store (Android).',
          image: '/guides/trust/download.png'
        },
        {
          title: 'Create Your ',
          description: 'Open the app and tap "Create a new ". Write down your recovery phrase.',
          image: '/guides/trust/create.png'
        },
        {
          title: 'Use Connect',
          description: 'On BridgeSpark, click "Connect " and select Connect, then scan the QR code with Trust .',
          image: '/guides/trust/connect.png'
        },
        {
          title: 'Approve Connection',
          description: 'In Trust , tap "Connect" to approve the connection to BridgeSpark.',
          image: '/guides/trust/approve.png'
        }
      ],
      tips: [
        'Trust  supports 1M+ cryptocurrencies',
        'Use the built-in DApp browser for easy access',
        'Enable transaction notifications',
        'Regularly backup your '
      ],
      troubleshooting: [
        {
          problem: 'QR code not scanning',
          solution: 'Make sure your camera has permission and try adjusting the lighting or distance.'
        },
        {
          problem: 'Connection keeps failing',
          solution: 'Try closing and reopening both apps, then attempt the connection again.'
        }
      ]
    },
    coindcx: {
      Id: 'coindcx',
      title: 'CoinDCX Exchange Setup Guide',
      steps: [
        {
          title: 'Create CoinDCX Account',
          description: 'Sign up for a CoinDCX account and complete the KYC verification process.',
          image: '/guides/coindcx/signup.png'
        },
        {
          title: 'Generate API Keys',
          description: 'Go to API settings in your CoinDCX account and create new API keys with trading permissions.',
          image: '/guides/coindcx/api-keys.png'
        },
        {
          title: 'Configure API Permissions',
          description: 'Set appropriate permissions for your API keys (read, trade, withdraw) based on your needs.',
          image: '/guides/coindcx/permissions.png'
        },
        {
          title: 'Connect to BridgeSpark',
          description: 'Enter your API Key and Secret in the CoinDCX connection form on BridgeSpark.',
          image: '/guides/coindcx/connect.png'
        }
      ],
      tips: [
        'Never share your API secret with anyone',
        'Use IP restrictions for added security',
        'Start with read-only permissions for testing',
        'Regularly rotate your API keys'
      ],
      troubleshooting: [
        {
          problem: 'API connection failed',
          solution: 'Verify your API keys are correct and have the necessary permissions enabled.'
        },
        {
          problem: 'KYC verification pending',
          solution: 'Complete the KYC process in your CoinDCX account before connecting to BridgeSpark.'
        }
      ]
    }
  };

  return guides[Type] || {
    Id: Type,
    title: `${Type} Setup Guide`,
    steps: [
      {
        title: 'Install ',
        description: `Install the ${Type}  from the official website or app store.`,
      },
      {
        title: 'Create Account',
        description: 'Create a new  account and securely store your recovery phrase.',
      },
      {
        title: 'Connect to BridgeSpark',
        description: 'Use the connect  feature to link your  to BridgeSpark.',
      }
    ],
    tips: [
      'Keep your recovery phrase safe and offline',
      'Never share your private keys',
      'Always verify you\'re on the correct website'
    ],
    troubleshooting: [
      {
        problem: 'Connection issues',
        solution: 'Try refreshing the page and ensuring your  is unlocked.'
      }
    ]
  };
}


