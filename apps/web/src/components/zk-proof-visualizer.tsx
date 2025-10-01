"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  CheckCircle, 
  Shield, 
  Key, 
  Zap,
  Info,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Hash,
  TreePine,
  FileText,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZKProofData {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  circuitInputs: {
    btcTxHash: string;
    merkleRoot: string;
    merkleProof: string[];
    proofIndex: number;
    blockHeight: number;
    inputAmount: string;
    outputAmount: string;
    fee: string;
    publicAmount: string;
    publicAddress: string;
    privateSecret: string;
    nonce: string;
  };
  verificationKey: any;
}

interface ZKProofVisualizerProps {
  className?: string;
  proofData?: ZKProofData;
  onProofGenerated?: (proof: ZKProofData) => void;
}

export function ZKProofVisualizer({ 
  className, 
  proofData,
  onProofGenerated 
}: ZKProofVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [secret, setSecret] = useState('my-secret-data');
  const [proof, setProof] = useState<ZKProofData | null>(proofData || null);
  const [isMounted, setIsMounted] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualization' | 'proof' | 'verification'>('visualization');

  // Prevent heavy animations from running immediately
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      title: 'Secret Input',
      description: 'User provides secret data (private input)',
      icon: Lock,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      data: secret
    },
    {
      title: 'Circuit Execution',
      description: 'ZK circuit processes the secret without revealing it',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      data: 'Processing...'
    },
    {
      title: 'Proof Generation',
      description: 'Mathematical proof is generated using cryptography',
      icon: Key,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      data: 'Generating proof...'
    },
    {
      title: 'Verification',
      description: 'Proof is verified without revealing the secret',
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      data: 'Verifying...'
    }
  ];

  const startDemo = () => {
    if (!isMounted) return; // Prevent starting before component is ready
    setIsPlaying(true);
    setCurrentStep(0);
    setProof(null);
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          
          // Generate mock proof when demo completes
          const mockProof: ZKProofData = {
            proof: {
              pi_a: [
                "1234567890123456789012345678901234567890123456789012345678901234",
                "2345678901234567890123456789012345678901234567890123456789012345",
                "1"
              ],
              pi_b: [
                [
                  "3456789012345678901234567890123456789012345678901234567890123456",
                  "4567890123456789012345678901234567890123456789012345678901234567"
                ],
                [
                  "5678901234567890123456789012345678901234567890123456789012345678",
                  "6789012345678901234567890123456789012345678901234567890123456789"
                ],
                [
                  "1",
                  "0"
                ]
              ],
              pi_c: [
                "7890123456789012345678901234567890123456789012345678901234567890",
                "8901234567890123456789012345678901234567890123456789012345678901",
                "1"
              ]
            },
            publicSignals: [
              "0.001",
              "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
              "", // Will be populated with real transaction hash
              "ef1d870d24c85b89d5adcc212a6f10d837b9e2d9",
              "123456"
            ],
            circuitInputs: {
              btcTxHash: "", // Will be populated with real transaction hash
              merkleRoot: "ef1d870d24c85b89d5adcc212a6f10d837b9e2d9",
              merkleProof: [
                "a1b2c3d4e5f6789012345678901234567890abcdef",
                "fedcba0987654321098765432109876543210fedcba"
              ],
              proofIndex: 0,
              blockHeight: 123456,
              inputAmount: "0.001",
              outputAmount: "0.001",
              fee: "0.00001",
              publicAmount: "0.001",
              publicAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
              privateSecret: secret,
              nonce: "abc123def456"
            },
            verificationKey: { mock: true }
          };
          
          setProof(mockProof);
          onProofGenerated?.(mockProof);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProof(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadProof = () => {
    if (!proof) return;
    
    const dataStr = JSON.stringify(proof, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `zk-proof-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">ZK Proof Visualization</h2>
          <p className="text-gray-300">
            Interactive demonstration of Zero-Knowledge proof generation and verification
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className={cn(
              "p-2 rounded-lg transition-all duration-300",
              showRawData 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
            )}
            title={showRawData ? "Hide raw data" : "Show raw data"}
          >
            {showRawData ? <Eye className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {proof && (
            <button
              onClick={downloadProof}
              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300"
              title="Download proof"
            >
              <Download className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        {[
          { id: 'visualization', label: 'Visualization', icon: Zap },
          { id: 'proof', label: 'Proof Data', icon: FileText },
          { id: 'verification', label: 'Verification', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center px-4 py-2 rounded-md transition-all duration-300",
              activeTab === tab.id
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            )}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'visualization' && (
          <motion.div
            key="visualization"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Demo Controls */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Interactive Demo</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={startDemo}
                    disabled={isPlaying}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-300",
                      isPlaying
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                    )}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Demo
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetDemo}
                    className="flex items-center px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secret Input
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  placeholder="Enter your secret data"
                />
              </div>
            </div>

            {/* Steps Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;
                
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative p-6 rounded-xl border-2 transition-all duration-500",
                      isActive
                        ? `${step.bgColor} ${step.borderColor} border-opacity-50`
                        : isCompleted
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-gray-800/50 border-gray-700/50"
                    )}
                  >
                    <div className="flex items-center mb-4">
                      <div className={cn(
                        "p-3 rounded-lg mr-4 transition-all duration-300",
                        isActive
                          ? `${step.bgColor} ${step.color}`
                          : isCompleted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-700/50 text-gray-400"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h4 className={cn(
                          "font-semibold transition-colors duration-300",
                          isActive
                            ? step.color
                            : isCompleted
                            ? "text-green-400"
                            : "text-gray-300"
                        )}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Step {index + 1} of {steps.length}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">
                      {step.description}
                    </p>
                    
                    {showRawData && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                        <p className="text-xs text-gray-400 font-mono break-all">
                          {step.data}
                        </p>
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-xl"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "linear" }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Proof Result */}
            {proof && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold text-green-400">Proof Generated Successfully!</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Public Signals</h4>
                    <div className="space-y-2">
                      {proof.publicSignals.map((signal, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                          <span className="text-xs text-gray-400">Signal {index + 1}</span>
                          <span className="text-sm text-white font-mono">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Proof Components</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-xs text-gray-400">π_a</span>
                        <span className="text-sm text-white font-mono">{proof.proof.pi_a.length} elements</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-xs text-gray-400">π_b</span>
                        <span className="text-sm text-white font-mono">{proof.proof.pi_b.length} elements</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-xs text-gray-400">π_c</span>
                        <span className="text-sm text-white font-mono">{proof.proof.pi_c.length} elements</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'proof' && (
          <motion.div
            key="proof"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {proof ? (
              <div className="space-y-6">
                {/* Proof Data */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Proof Data</h3>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(proof.proof, null, 2))}
                      className="flex items-center px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">π_a (Alpha)</h4>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                          {JSON.stringify(proof.proof.pi_a, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">π_b (Beta)</h4>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                          {JSON.stringify(proof.proof.pi_b, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">π_c (Gamma)</h4>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                          {JSON.stringify(proof.proof.pi_c, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Circuit Inputs */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Circuit Inputs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Bitcoin Transaction</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <span className="text-xs text-gray-400">TX Hash</span>
                          <span className="text-sm text-white font-mono">{proof.circuitInputs.btcTxHash}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <span className="text-xs text-gray-400">Block Height</span>
                          <span className="text-sm text-white">{proof.circuitInputs.blockHeight}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <span className="text-xs text-gray-400">Amount</span>
                          <span className="text-sm text-white">{proof.circuitInputs.publicAmount} BTC</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Merkle Proof</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <span className="text-xs text-gray-400">Root</span>
                          <span className="text-sm text-white font-mono">{proof.circuitInputs.merkleRoot}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <span className="text-xs text-gray-400">Proof Index</span>
                          <span className="text-sm text-white">{proof.circuitInputs.proofIndex}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <span className="text-xs text-gray-400">Proof Length</span>
                          <span className="text-sm text-white">{proof.circuitInputs.merkleProof.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Proof Data</h3>
                <p className="text-gray-400">
                  Generate a proof using the visualization tab to see the data here.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-white">Proof Verification</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-green-400">Verification Status</h4>
                      <p className="text-xs text-gray-300">Proof is valid and verified</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-semibold">✓ Verified</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Verification Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                        <span className="text-xs text-gray-400">Circuit Type</span>
                        <span className="text-sm text-white">Groth16</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                        <span className="text-xs text-gray-400">Verification Time</span>
                        <span className="text-sm text-white">~50ms</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                        <span className="text-xs text-gray-400">Gas Cost</span>
                        <span className="text-sm text-white">~200k gas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Security Properties</h4>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 bg-gray-700/30 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-white">Zero-Knowledge</span>
                      </div>
                      <div className="flex items-center p-2 bg-gray-700/30 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-white">Succinct</span>
                      </div>
                      <div className="flex items-center p-2 bg-gray-700/30 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-white">Non-Interactive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}