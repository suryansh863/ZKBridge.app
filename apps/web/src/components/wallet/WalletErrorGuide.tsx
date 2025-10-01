/**
 *  Error Guide Component
 * Provides solutions for common  connection errors
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Download, 
  Settings,
  ExternalLink,
  X,
  Info
} from 'lucide-react';

interface ErrorGuideProps {
  error: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ErrorGuide({ error, isOpen, onClose }: ErrorGuideProps) {
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);

  const getErrorSolutions = (errorMessage: string) => {
    const solutions = [];

    if (errorMessage.includes('message port closed')) {
      solutions.push(
        {
          title: 'Extension Connection Interrupted',
          description: 'The  extension connection was interrupted',
          steps: [
            'Make sure your  extension is running and unlocked',
            'Close any open  popups and try again',
            'Refresh the page and attempt the connection',
            'If the problem persists, restart your browser'
          ],
          icon: <RefreshCw className="w-5 h-5" />
        },
        {
          title: 'Extension Not Responding',
          description: 'The  extension may be frozen or crashed',
          steps: [
            'Check if the extension icon is visible in your browser toolbar',
            'Click on the extension icon to see if it responds',
            'Disable and re-enable the extension in browser settings',
            'Restart your browser completely'
          ],
          icon: <Settings className="w-5 h-5" />
        }
      );
    } else if (errorMessage.includes('not installed')) {
      solutions.push(
        {
          title: 'Install  Extension',
          description: 'The required  extension is not installed',
          steps: [
            'Visit the official  website (e.g., metamask.io)',
            'Download and install the browser extension',
            'Create a new  or import an existing one',
            'Refresh this page and try connecting again'
          ],
          icon: <Download className="w-5 h-5" />,
          action: {
            label: 'Install MetaMask',
            url: 'https://metamask.io/download/'
          }
        }
      );
    } else if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
      solutions.push(
        {
          title: 'Connection Rejected',
          description: 'You rejected the  connection request',
          steps: [
            'Click the "Connect " button again',
            'When the  popup appears, click "Connect" or "Approve"',
            'Make sure to complete the connection process',
            'Check that you\'re not blocking popups for this site'
          ],
          icon: <CheckCircle className="w-5 h-5" />
        }
      );
    } else if (errorMessage.includes('network') || errorMessage.includes('chain')) {
      solutions.push(
        {
          title: 'Wrong Network',
          description: 'You\'re connected to the wrong network',
          steps: [
            'Open your  extension',
            'Switch to the correct network (Ethereum Mainnet)',
            'Make sure you have some ETH for gas fees',
            'Try the connection again'
          ],
          icon: <Settings className="w-5 h-5" />
        }
      );
    } else {
      solutions.push(
        {
          title: 'General Troubleshooting',
          description: 'Try these general solutions',
          steps: [
            'Refresh the page and try again',
            'Clear your browser cache and cookies',
            'Make sure you\'re using a supported browser',
            'Check your internet connection'
          ],
          icon: <RefreshCw className="w-5 h-5" />
        }
      );
    }

    return solutions;
  };

  const solutions = getErrorSolutions(error);

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
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white"> Connection Error</h2>
                <p className="text-sm text-gray-400">Let&apos;s fix this together</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Error Message */}
          <div className="p-6 border-b border-gray-700">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-400 font-medium mb-1">Error Details</h3>
                  <p className="text-gray-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Try These Solutions</h3>
            
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <button
                    onClick={() => setSelectedSolution(selectedSolution === index ? null : index)}
                    className="w-full p-4 text-left hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        {solution.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{solution.title}</h4>
                        <p className="text-sm text-gray-400">{solution.description}</p>
                      </div>
                      <div className="text-gray-400">
                        {selectedSolution === index ? '−' : '+'}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {selectedSolution === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-700"
                      >
                        <div className="p-4">
                          <div className="space-y-3">
                            {solution.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs text-blue-400 font-medium">
                                    {stepIndex + 1}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">{step}</p>
                              </div>
                            ))}
                          </div>

                          {solution.action && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <a
                                href={solution.action.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {solution.action.label}
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Info className="w-3 h-3" />
              <span>If none of these solutions work, try using a different  or contact support.</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Quick error message component for inline display
 */
interface QuickErrorProps {
  error: string;
  onShowGuide?: () => void;
}

export function QuickError({ error, onShowGuide }: QuickErrorProps) {
  const getQuickMessage = (errorMessage: string) => {
    if (errorMessage.includes('message port closed')) {
      return 'Extension connection interrupted. Try refreshing the page.';
    } else if (errorMessage.includes('not installed')) {
      return ' extension not installed. Please install and try again.';
    } else if (errorMessage.includes('User rejected')) {
      return 'Connection was rejected. Please approve in your .';
    } else {
      return 'Connection failed. Click for troubleshooting guide.';
    }
  };

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-400 text-sm">{getQuickMessage(error)}</p>
          {onShowGuide && (
            <button
              onClick={onShowGuide}
              className="text-xs text-red-300 hover:text-red-200 underline mt-1"
            >
              Show troubleshooting guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


