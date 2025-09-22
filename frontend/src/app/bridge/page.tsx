"use client"

import { useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, ArrowRight, ExternalLink, Copy } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface BridgeStep {
  id: number
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  icon: React.ReactNode
}

interface BitcoinTransaction {
  txid: string
  amount: number
  confirmations: number
  status: 'pending' | 'confirmed'
}

export default function BridgePage() {
  const { address, isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [bitcoinTx, setBitcoinTx] = useState('')
  const [bitcoinAddress, setBitcoinAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [transaction, setTransaction] = useState<BitcoinTransaction | null>(null)
  const [proofGenerated, setProofGenerated] = useState(false)
  const [bridgeTxHash, setBridgeTxHash] = useState('')

  const steps: BridgeStep[] = [
    {
      id: 1,
      title: 'Verify Bitcoin Transaction',
      description: 'Enter your Bitcoin transaction ID to verify it on the blockchain',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      id: 2,
      title: 'Generate ZK Proof',
      description: 'Generate cryptographic proof of your Bitcoin transaction',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      id: 3,
      title: 'Bridge to Ethereum',
      description: 'Complete the bridge transaction on Ethereum network',
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending',
      icon: <ArrowRight className="w-5 h-5" />
    }
  ]

  const validateBitcoinAddress = (address: string): boolean => {
    // Basic Bitcoin address validation
    const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/
    return btcRegex.test(address)
  }

  const validateBitcoinTx = (txid: string): boolean => {
    // Basic Bitcoin transaction ID validation
    const txRegex = /^[a-fA-F0-9]{64}$/
    return txRegex.test(txid)
  }

  const handleVerifyTransaction = async () => {
    if (!validateBitcoinTx(bitcoinTx)) {
      alert('Invalid Bitcoin transaction ID')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to verify Bitcoin transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock transaction data
      setTransaction({
        txid: bitcoinTx,
        amount: parseFloat(amount) || 0.001,
        confirmations: 6,
        status: 'confirmed'
      })
      
      setCurrentStep(2)
    } catch (error) {
      console.error('Error verifying transaction:', error)
      alert('Failed to verify transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateProof = async () => {
    setIsLoading(true)
    try {
      // Simulate ZK proof generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      setProofGenerated(true)
      setCurrentStep(3)
    } catch (error) {
      console.error('Error generating proof:', error)
      alert('Failed to generate proof')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBridgeToEthereum = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      // Simulate bridge transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock bridge transaction hash
      const mockHash = '0x' + Math.random().toString(16).substr(2, 40)
      setBridgeTxHash(mockHash)
      setCurrentStep(4)
    } catch (error) {
      console.error('Error bridging to Ethereum:', error)
      alert('Failed to bridge to Ethereum')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

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
            Bitcoin Bridge
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Securely bridge your Bitcoin to Ethereum using Zero-Knowledge proofs. 
            Trustless, fast, and secure.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Bridge Steps */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">Bridge Process</h2>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      step.status === 'active' 
                        ? 'bg-blue-500/20 border border-blue-500/30' 
                        : step.status === 'completed'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-gray-800/50 border border-gray-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      step.status === 'active' 
                        ? 'bg-blue-500 text-white' 
                        : step.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {step.icon}
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        step.status === 'active' ? 'text-blue-400' : 'text-white'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bridge Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8">
              {/* Step 1: Bitcoin Transaction Verification */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Verify Bitcoin Transaction</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bitcoin Address
                      </label>
                      <input
                        type="text"
                        value={bitcoinAddress}
                        onChange={(e) => setBitcoinAddress(e.target.value)}
                        placeholder="Enter your Bitcoin address"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        value={bitcoinTx}
                        onChange={(e) => setBitcoinTx(e.target.value)}
                        placeholder="Enter Bitcoin transaction ID"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (BTC)
                      </label>
                      <input
                        type="number"
                        step="0.00000001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.001"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleVerifyTransaction}
                      disabled={isLoading || !bitcoinTx || !amount}
                      className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify Transaction'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Transaction Details & Proof Generation */}
              {currentStep === 2 && transaction && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Transaction Verified</h2>
                  
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Transaction Confirmed</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400">Transaction ID</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400 flex-1">
                            {transaction.txid}
                          </code>
                          <button
                            onClick={() => copyToClipboard(transaction.txid)}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">Amount</label>
                        <p className="text-white font-medium">{transaction.amount} BTC</p>
                      </div>

                      <div>
                        <label className="text-sm text-gray-400">Confirmations</label>
                        <p className="text-white font-medium">{transaction.confirmations}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-2">Fee Estimation</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Network Fee:</span>
                            <span className="text-white">~$2.50</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bridge Fee:</span>
                            <span className="text-white">0.1%</span>
                          </div>
                          <div className="border-t border-gray-600 pt-2 flex justify-between font-medium">
                            <span className="text-gray-300">Total:</span>
                            <span className="text-white">~$3.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateProof}
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Proof...
                      </div>
                    ) : (
                      'Generate ZK Proof'
                    )}
                  </button>
                </motion.div>
              )}

              {/* Step 3: Bridge to Ethereum */}
              {currentStep === 3 && proofGenerated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Bridge to Ethereum</h2>
                  
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 font-medium">ZK Proof Generated</span>
                    </div>
                  </div>

                  {!isConnected ? (
                    <div className="text-center py-8">
                      <p className="text-gray-300 mb-4">Connect your wallet to continue</p>
                      <ConnectButton />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-2">Bridge Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">From:</span>
                            <span className="text-white">{bitcoinAddress.slice(0, 8)}...{bitcoinAddress.slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">To:</span>
                            <span className="text-white">{address?.slice(0, 8)}...{address?.slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-white">{transaction?.amount} BTC</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Estimated Gas:</span>
                            <span className="text-white">~$15</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleBridgeToEthereum}
                        disabled={isLoading}
                        className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Bridging...
                          </div>
                        ) : (
                          'Complete Bridge'
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-8 mb-6">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Bridge Successful!</h2>
                    <p className="text-gray-300">
                      Your Bitcoin has been successfully bridged to Ethereum
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                    <h3 className="text-white font-medium mb-2">Transaction Details</h3>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400 flex-1">
                        {bridgeTxHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(bridgeTxHash)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <a
                        href={`https://etherscan.io/tx/${bridgeTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentStep(1)
                      setBitcoinTx('')
                      setBitcoinAddress('')
                      setAmount('')
                      setTransaction(null)
                      setProofGenerated(false)
                      setBridgeTxHash('')
                    }}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Start New Bridge
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
