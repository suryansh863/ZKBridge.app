"use client"

import { useState, useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, ArrowRight, ExternalLink, Copy, Hash, Eye } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MerkleTreeVisualizer } from '@/components/merkle-tree-visualizer'

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
  blockHeight?: number
  blockHash?: string
  inputs: Array<{
    address: string
    value: number
  }>
  outputs: Array<{
    address: string
    value: number
  }>
  fee: number
  size: number
}

interface MerkleProof {
  merkleRoot: string
  proofPath: string[]
  proofIndex: number
  transactionHash: string
  blockHeight: number
  blockHash: string
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
  const [merkleProof, setMerkleProof] = useState<MerkleProof | null>(null)
  const [sampleTransactions, setSampleTransactions] = useState<Array<{txHash: string, description: string}>>([])
  const [showSampleTransactions, setShowSampleTransactions] = useState(false)
  const [loadingSamples, setLoadingSamples] = useState(true)

  useEffect(() => {
    // Load sample transactions for demo
    const loadSampleTransactions = async () => {
      try {
        const response = await fetch('/api/bitcoin/sample-transactions')
        if (response.ok) {
          const data = await response.json()
          setSampleTransactions(data.data || [])
        }
      } catch (error) {
        console.error('Failed to load sample transactions:', error)
      } finally {
        setLoadingSamples(false)
      }
    }
    
    loadSampleTransactions()
  }, [])

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
      // Get real Bitcoin transaction data
      const response = await fetch(`/api/bitcoin/detailed-transaction/${bitcoinTx}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 500 && errorData.message?.includes('Transaction not found')) {
          throw new Error('Transaction not found on Bitcoin testnet. The sample transactions are for demo purposes only. Please use a real testnet transaction ID from https://blockstream.info/testnet/')
        }
        throw new Error(errorData.message || 'Failed to fetch transaction')
      }
      
      const data = await response.json()
      const txData = data.data
      
      // Convert to our interface format
      const transactionInfo: BitcoinTransaction = {
        txid: txData.txid,
        amount: txData.vout.reduce((sum: number, output: any) => sum + output.value, 0) / 100000000,
        confirmations: 0, // Will be calculated separately
        status: txData.status.confirmed ? 'confirmed' : 'pending',
        blockHeight: txData.status.block_height,
        blockHash: txData.status.block_hash,
        inputs: txData.vin.map((input: any) => ({
          address: input.prevout.scriptpubkey_address,
          value: input.prevout.value / 100000000
        })),
        outputs: txData.vout.map((output: any) => ({
          address: output.scriptpubkey_address,
          value: output.value / 100000000
        })),
        fee: txData.fee / 100000000,
        size: txData.size
      }
      
      // Get confirmation count
      const confirmResponse = await fetch(`/api/bitcoin/transaction/${bitcoinTx}`)
      if (confirmResponse.ok) {
        const confirmData = await confirmResponse.json()
        transactionInfo.confirmations = confirmData.data.confirmations
      }
      
      setTransaction(transactionInfo)
      setCurrentStep(2)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error verifying transaction:', errorMessage)
      alert(`Failed to verify transaction: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateProof = async () => {
    if (!transaction) return
    
    setIsLoading(true)
    try {
      // Generate real Merkle proof
      const response = await fetch(`/api/bitcoin/detailed-merkle-proof/${transaction.txid}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate Merkle proof')
      }
      
      const data = await response.json()
      const proofData = data.data
      
      // Convert to our interface format
      const merkleProofInfo: MerkleProof = {
        merkleRoot: proofData.merkleRoot,
        proofPath: proofData.proofPath,
        proofIndex: proofData.proofIndex,
        transactionHash: proofData.transactionHash,
        blockHeight: proofData.blockHeight,
        blockHash: proofData.blockHash
      }
      
      setMerkleProof(merkleProofInfo)
      setProofGenerated(true)
      setCurrentStep(3)
    } catch (error) {
      console.error('Error generating proof:', error)
      alert(`Failed to generate proof: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSampleTransaction = (txHash: string) => {
    setBitcoinTx(txHash)
    setShowSampleTransactions(false)
  }

  const handleBridgeToEthereum = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!transaction || !merkleProof) {
      alert('Missing transaction or proof data')
      return
    }

    setIsLoading(true)
    try {
      // Store bridge attempt in database
      const storeResponse = await fetch('/api/bridge/store-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bitcoinTxId: transaction.txid,
          ethereumAddress: address,
          userId: address // Using wallet address as user ID for now
        })
      })

      if (!storeResponse.ok) {
        throw new Error('Failed to store bridge attempt')
      }

      const storeData = await storeResponse.json()
      console.log('Bridge attempt stored:', storeData.data.bridgeId)
      
      // Simulate bridge transaction (in real implementation, this would interact with smart contracts)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock bridge transaction hash
      const mockHash = '0x' + Math.random().toString(16).substr(2, 40)
      setBridgeTxHash(mockHash)
      setCurrentStep(4)
    } catch (error) {
      console.error('Error bridging to Ethereum:', error)
      alert(`Failed to bridge to Ethereum: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

        <div className="max-w-6xl mx-auto">
          {/* Mobile-first responsive layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bridge Steps - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="glass-card p-6 sticky top-8">
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
              <div className="glass-card p-4 md:p-8">
                {/* Mobile Progress Indicator */}
                <div className="lg:hidden mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Step {currentStep} of 3</h2>
                    <span className="text-sm text-gray-400">{Math.round((currentStep / 3) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">{steps[currentStep - 1]?.title}</p>
                  </div>
                </div>

                {/* Step 1: Bitcoin Transaction Verification */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">Verify Bitcoin Transaction</h2>
                    
                    {/* Sample Transactions */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-400 mb-1">🎯 Try Sample Transactions</h3>
                          <p className="text-sm text-gray-400">⚠️ Demo transactions (not real) - Use for testing UI only</p>
                        </div>
                        {!loadingSamples && sampleTransactions.length > 0 && (
                          <button
                            onClick={() => setShowSampleTransactions(!showSampleTransactions)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-500/10 transition-colors"
                          >
                            {showSampleTransactions ? 'Hide' : 'Show'} Samples
                          </button>
                        )}
                      </div>
                      
                      {loadingSamples ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-3 text-blue-400 text-sm">Loading sample transactions...</span>
                        </div>
                      ) : showSampleTransactions && sampleTransactions.length > 0 ? (
                        <div className="space-y-3">
                          {sampleTransactions.map((sample, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/30 transition-colors">
                              <div className="flex-1 mb-3 sm:mb-0">
                                <p className="text-sm text-gray-300 font-medium mb-1">{sample.description}</p>
                                <code className="text-xs text-blue-400 font-mono bg-gray-900/50 px-2 py-1 rounded">
                                  {sample.txHash.substring(0, 20)}...{sample.txHash.substring(sample.txHash.length - 20)}
                                </code>
                              </div>
                              <button
                                onClick={() => handleSampleTransaction(sample.txHash)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all hover:scale-105"
                              >
                                Use This Transaction
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : !loadingSamples && sampleTransactions.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-gray-400 text-sm mb-2">No sample transactions available</p>
                          <p className="text-xs text-gray-500">You can still enter your own Bitcoin testnet transaction ID</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bitcoin Transaction ID (Testnet)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bitcoinTx}
                            onChange={(e) => setBitcoinTx(e.target.value)}
                            placeholder="Enter Bitcoin transaction ID"
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                          />
                          {bitcoinTx && (
                            <button
                              onClick={() => setBitcoinTx('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter a 64-character hexadecimal transaction ID</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Amount (BTC)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.00000001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.001"
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                            BTC
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Amount in Bitcoin (minimum 0.00000001 BTC)</p>
                      </div>

                      <button
                        onClick={handleVerifyTransaction}
                        disabled={isLoading || !bitcoinTx || !amount}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Verifying Transaction...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Hash className="w-5 h-5 mr-2" />
                            Verify Transaction
                          </div>
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
                            <a
                              href={`https://blockstream.info/testnet/tx/${transaction.txid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </a>
                          </div>
                        </div>

                        {transaction.blockHeight && (
                          <div>
                            <label className="text-sm text-gray-400">Block Height</label>
                            <p className="text-white font-mono">{transaction.blockHeight}</p>
                          </div>
                        )}

                        {transaction.blockHash && (
                          <div>
                            <label className="text-sm text-gray-400">Block Hash</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400 flex-1">
                                {transaction.blockHash.substring(0, 16)}...{transaction.blockHash.substring(transaction.blockHash.length - 16)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(transaction.blockHash!)}
                                className="p-1 hover:bg-gray-700 rounded"
                              >
                                <Copy className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm text-gray-400">Amount</label>
                          <p className="text-white font-medium">{transaction.amount.toFixed(8)} BTC</p>
                        </div>

                        {transaction.fee > 0 && (
                          <div>
                            <label className="text-sm text-gray-400">Transaction Fee</label>
                            <p className="text-white font-medium">{transaction.fee.toFixed(8)} BTC</p>
                          </div>
                        )}

                        {transaction.size > 0 && (
                          <div>
                            <label className="text-sm text-gray-400">Transaction Size</label>
                            <p className="text-white font-medium">{transaction.size} bytes</p>
                          </div>
                        )}

                        <div>
                          <label className="text-sm text-gray-400">Confirmations</label>
                          <p className="text-white font-medium">{transaction.confirmations}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Inputs */}
                        {transaction.inputs && transaction.inputs.length > 0 && (
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <h3 className="text-white font-medium mb-3">Inputs ({transaction.inputs.length})</h3>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {transaction.inputs.map((input, index) => (
                                <div key={index} className="text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Address:</span>
                                    <code className="text-blue-400 text-xs">
                                      {input.address.substring(0, 12)}...{input.address.substring(input.address.length - 8)}
                                    </code>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Value:</span>
                                    <span className="text-white">{input.value.toFixed(8)} BTC</span>
                                  </div>
                                  {index < transaction.inputs.length - 1 && <hr className="border-gray-600 my-2" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outputs */}
                        {transaction.outputs && transaction.outputs.length > 0 && (
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <h3 className="text-white font-medium mb-3">Outputs ({transaction.outputs.length})</h3>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {transaction.outputs.map((output, index) => (
                                <div key={index} className="text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Address:</span>
                                    <code className="text-green-400 text-xs">
                                      {output.address.substring(0, 12)}...{output.address.substring(output.address.length - 8)}
                                    </code>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Value:</span>
                                    <span className="text-white">{output.value.toFixed(8)} BTC</span>
                                  </div>
                                  {index < transaction.outputs.length - 1 && <hr className="border-gray-600 my-2" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-400 font-medium">Merkle Proof Generated</span>
                      </div>
                    </div>

                    {/* Merkle Tree Visualizer */}
                    {merkleProof && (
                      <div className="mb-6">
                        <MerkleTreeVisualizer
                          merkleRoot={merkleProof.merkleRoot}
                          proofPath={merkleProof.proofPath}
                          proofIndex={merkleProof.proofIndex}
                          transactionHash={merkleProof.transactionHash}
                          blockHeight={merkleProof.blockHeight}
                          blockHash={merkleProof.blockHash}
                        />
                      </div>
                    )}

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
        </div>
      </main>

      <Footer />
    </div>
  )
}