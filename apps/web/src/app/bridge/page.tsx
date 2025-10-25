"use client"

import { useState, useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, ArrowRight, ExternalLink, Copy, Hash, Eye, QrCode, Clipboard, Link, Info } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MerkleTreeVisualizer } from '@/components/merkle-tree-visualizer'
import { QRScannerSimple } from '@/components/qr-scanner-simple'

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
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [clipboardDetected, setClipboardDetected] = useState('')
  const [showHelpTooltip, setShowHelpTooltip] = useState(false)
  const [clipboardError, setClipboardError] = useState('')
  const [qrScannerError, setQrScannerError] = useState('')

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

  // Auto-detect Bitcoin transaction IDs from clipboard and URLs
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') || ''
      
      // Check if pasted text contains a Bitcoin transaction ID
      const txIdMatch = text.match(/\b[a-fA-F0-9]{64}\b/)
      if (txIdMatch) {
        setBitcoinTx(txIdMatch[0])
        setClipboardDetected('Transaction ID detected from clipboard!')
        setTimeout(() => setClipboardDetected(''), 3000)
        return
      }
      
      // Check if pasted text is a Bitcoin explorer URL
      const urlPatterns = [
        /blockstream\.info\/testnet\/tx\/([a-fA-F0-9]{64})/,
        /blockchain\.info\/tx\/([a-fA-F0-9]{64})/,
        /mempool\.space\/testnet\/tx\/([a-fA-F0-9]{64})/,
        /btc\.com\/btc-testnet\/tx\/([a-fA-F0-9]{64})/
      ]
      
      for (const pattern of urlPatterns) {
        const match = text.match(pattern)
        if (match) {
          setBitcoinTx(match[1])
          setClipboardDetected('Transaction ID extracted from URL!')
          setTimeout(() => setClipboardDetected(''), 3000)
          return
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  // Function to extract transaction ID from various formats
  const extractTransactionId = (input: string): string | null => {
    if (!input) return null
    
    // Direct transaction ID
    if (/^[a-fA-F0-9]{64}$/.test(input.trim())) {
      return input.trim()
    }
    
    // Bitcoin explorer URLs
    const urlPatterns = [
      /blockstream\.info\/testnet\/tx\/([a-fA-F0-9]{64})/,
      /blockchain\.info\/tx\/([a-fA-F0-9]{64})/,
      /mempool\.space\/testnet\/tx\/([a-fA-F0-9]{64})/,
      /btc\.com\/btc-testnet\/tx\/([a-fA-F0-9]{64})/,
      /tx\/([a-fA-F0-9]{64})/
    ]
    
    for (const pattern of urlPatterns) {
      const match = input.match(pattern)
      if (match) {
        return match[1]
      }
    }
    
    // Look for transaction ID anywhere in the text
    const txIdMatch = input.match(/\b[a-fA-F0-9]{64}\b/)
    return txIdMatch ? txIdMatch[0] : null
  }

  // Comprehensive clipboard reading function with fallbacks
  const readFromClipboard = async () => {
    try {
      setClipboardError('')
      setClipboardDetected('')
      
      let clipboardText = ''
      
      // Method 1: Modern Clipboard API (preferred)
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          // Request permission first
          const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName }).catch(() => null)
          
          if (permission && permission.state === 'denied') {
            throw new Error('Clipboard access denied by user')
          }
          
          clipboardText = await navigator.clipboard.readText()
        } catch (apiError) {
          console.log('Clipboard API failed, trying fallback:', apiError)
          throw apiError
        }
      } else {
        throw new Error('Clipboard API not available')
      }
      
      // If we got text from clipboard
      if (clipboardText && clipboardText.trim()) {
        const txId = extractTransactionId(clipboardText)
        if (txId) {
          setBitcoinTx(txId)
          setClipboardDetected('Transaction ID pasted successfully!')
          setTimeout(() => setClipboardDetected(''), 3000)
        } else {
          setClipboardError('No Bitcoin transaction ID found in clipboard')
          setTimeout(() => setClipboardError(''), 3000)
        }
      } else {
        setClipboardError('Clipboard is empty')
        setTimeout(() => setClipboardError(''), 3000)
      }
      
    } catch (error: any) {
      console.error('Clipboard read error:', error)
      
      // Method 2: Fallback - Create a temporary textarea and use execCommand
      try {
        const textarea = document.createElement('textarea')
        textarea.style.position = 'fixed'
        textarea.style.left = '-999999px'
        textarea.style.top = '-999999px'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        
        // Focus and paste
        textarea.focus()
        const success = document.execCommand('paste')
        
        if (success && textarea.value) {
          const txId = extractTransactionId(textarea.value)
          if (txId) {
            setBitcoinTx(txId)
            setClipboardDetected('Transaction ID pasted!')
            setTimeout(() => setClipboardDetected(''), 3000)
          } else {
            setClipboardError('No Bitcoin transaction ID found in clipboard')
            setTimeout(() => setClipboardError(''), 3000)
          }
        } else {
          throw new Error('execCommand paste failed')
        }
        
        document.body.removeChild(textarea)
        
      } catch (fallbackError) {
        console.error('Fallback clipboard method failed:', fallbackError)
        
        // Method 3: Show user-friendly error with manual instructions
        setClipboardError('Please paste manually (Ctrl+V or Cmd+V) into the input field')
        setTimeout(() => setClipboardError(''), 5000)
      }
    }
  }

  // QR Scanner handlers
  const handleQRScan = (result: string) => {
    setBitcoinTx(result)
    setShowQRScanner(false)
    setClipboardDetected('Transaction ID scanned from QR code!')
    setTimeout(() => setClipboardDetected(''), 3000)
  }

  const handleQRError = (error: string) => {
    setQrScannerError(error)
    setTimeout(() => setQrScannerError(''), 5000)
  }

  const handleQRClose = () => {
    setShowQRScanner(false)
    setQrScannerError('')
  }

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
        let errorMessage = 'Failed to fetch transaction'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          // If response is not JSON, get the text
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        throw new Error('Invalid response format from server')
      }
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Invalid transaction data received')
      }
      
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
      console.error('Error verifying transaction:', error)
      alert(`Failed to verify transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      
      // Update the bridge transaction status to completed
      try {
        const updateResponse = await fetch(`/api/bridge/${storeData.data.bridgeId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'COMPLETED',
            targetTxHash: mockHash
          })
        })

        if (updateResponse.ok) {
          console.log('Bridge transaction marked as completed')
        } else {
          console.error('Failed to update bridge status')
        }
      } catch (updateError) {
        console.error('Error updating bridge status:', updateError)
      }
      
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
                          <p className="text-sm text-gray-400">Test the bridge with real Bitcoin testnet transactions</p>
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
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                            <p className="text-blue-400 text-sm font-medium flex items-center">
                              <Info className="w-4 h-4 mr-2" />
                              Demo Transactions Available
                            </p>
                            <p className="text-blue-300/80 text-xs mt-1">
                              Click &quot;Use This Transaction&quot; to try the bridge with pre-loaded test data
                            </p>
                          </div>
                          
                          {sampleTransactions.map((sample, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                              <div className="space-y-4">
                                <div className="flex items-start mb-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-300 font-medium leading-relaxed">{sample.description}</p>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    <code className="text-xs text-blue-400 font-mono bg-gray-900/50 px-3 py-2 rounded break-all flex-1 min-w-0">
                                      {sample.txHash}
                                    </code>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(sample.txHash)}
                                      className="p-2 text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
                                      title="Copy full transaction ID"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => handleSampleTransaction(sample.txHash)}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all hover:scale-105 flex items-center justify-center space-x-2"
                                  >
                                    <span>Use This Transaction</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="bg-gray-700/30 rounded-lg p-3 mt-4">
                            <p className="text-gray-400 text-xs">
                              💡 <strong>Tip:</strong> These are demo transactions for testing. In real usage, you&apos;ll use your own Bitcoin transaction IDs from your wallet.
                            </p>
                          </div>
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
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Bitcoin Transaction ID (Testnet)
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => setShowHelpTooltip(!showHelpTooltip)}
                              className="text-gray-400 hover:text-gray-300 transition-colors"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            {showHelpTooltip && (
                              <div className="absolute right-0 top-8 w-80 sm:w-96 bg-gray-800 border border-gray-600 rounded-lg p-4 text-xs text-gray-300 z-50 shadow-2xl max-w-[calc(100vw-2rem)]">
                                <div className="space-y-3">
                                  <p className="font-medium text-white text-sm">Easy ways to enter your transaction ID:</p>
                                  <ul className="space-y-2">
                                  <li className="flex items-start space-x-2">
                                    <span className="text-blue-400">•</span>
                                    <span><strong>📱 Scan QR code:</strong> Click the QR button to scan with your camera</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <span className="text-blue-400">•</span>
                                    <span><strong>📋 Click clipboard button:</strong> Automatically reads from your clipboard</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <span className="text-blue-400">•</span>
                                    <span><strong>⌨️ Manual paste:</strong> Copy any Bitcoin explorer URL and paste (Ctrl+V)</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <span className="text-blue-400">•</span>
                                    <span><strong>🎯 Use samples:</strong> Click &quot;Use This Transaction&quot; from the list above</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <span className="text-blue-400">•</span>
                                    <span><strong>✏️ Type manually:</strong> Enter the 64-character transaction ID directly</span>
                                  </li>
                                  </ul>
                                  <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mt-3">
                                    <p className="text-blue-400 font-medium text-sm">💡 Pro Tip:</p>
                                    <p className="text-blue-300/80 text-xs mt-1">Copy any Bitcoin explorer URL (like blockstream.info) and paste it - we&apos;ll extract the transaction ID automatically!</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="relative">
                          <input
                            type="text"
                            value={bitcoinTx}
                            onChange={(e) => {
                              setBitcoinTx(e.target.value)
                              // Clear any previous messages when user types
                              if (clipboardDetected) setClipboardDetected('')
                              if (clipboardError) setClipboardError('')
                            }}
                            onPaste={(e) => {
                              // Handle paste events - let the browser paste first, then process
                              setTimeout(() => {
                                const pastedText = e.clipboardData?.getData('text') || ''
                                const txId = extractTransactionId(pastedText)
                                if (txId && txId !== bitcoinTx) {
                                  setBitcoinTx(txId)
                                  setClipboardDetected('Transaction ID extracted from pasted content!')
                                  setTimeout(() => setClipboardDetected(''), 3000)
                                }
                              }, 10)
                            }}
                            placeholder="Paste Bitcoin transaction ID or explorer URL here..."
                            className="w-full px-4 py-3 pr-20 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all duration-200"
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                            {bitcoinTx ? (
                              <button
                                onClick={() => setBitcoinTx('')}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                title="Clear"
                              >
                                ✕
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={readFromClipboard}
                                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                  title="Paste from clipboard"
                                >
                                  <Clipboard className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowQRScanner(true)}
                                  className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                  title="Scan QR code"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {clipboardDetected && (
                          <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-green-400 text-xs flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {clipboardDetected}
                            </p>
                          </div>
                        )}
                        
                        {clipboardError && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-xs flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {clipboardError}
                            </p>
                          </div>
                        )}
                        
                        {qrScannerError && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-xs flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              QR Scanner: {qrScannerError}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                          <div className="text-xs text-gray-500">
                            💡 <strong>Easy options:</strong> Paste any Bitcoin explorer URL, copy transaction ID from your wallet, or use sample transactions above
                          </div>
                        </div>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <label className="text-sm text-gray-400 block mb-2">Transaction ID</label>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-900 px-3 py-2 rounded text-blue-400 flex-1 break-all">
                              {transaction.txid}
                            </code>
                            <button
                              onClick={() => copyToClipboard(transaction.txid)}
                              className="p-2 hover:bg-gray-700 rounded transition-colors"
                              title="Copy transaction ID"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                            <a
                              href={`https://blockstream.info/testnet/tx/${transaction.txid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-700 rounded transition-colors"
                              title="View on blockstream"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </a>
                          </div>
                        </div>

                        {transaction.blockHeight && (
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <label className="text-sm text-gray-400 block mb-2">Block Height</label>
                            <p className="text-white font-mono text-lg">{transaction.blockHeight}</p>
                          </div>
                        )}

                        {transaction.blockHash && (
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <label className="text-sm text-gray-400 block mb-2">Block Hash</label>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs bg-gray-900 px-3 py-2 rounded text-green-400 flex-1 break-all">
                                {transaction.blockHash.substring(0, 16)}...{transaction.blockHash.substring(transaction.blockHash.length - 16)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(transaction.blockHash!)}
                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                title="Copy block hash"
                              >
                                <Copy className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <label className="text-sm text-gray-400 block mb-2">Amount</label>
                          <p className="text-white font-medium text-lg">{transaction.amount.toFixed(8)} BTC</p>
                        </div>

                        {transaction.fee > 0 && (
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <label className="text-sm text-gray-400 block mb-2">Transaction Fee</label>
                            <p className="text-white font-medium text-lg">{transaction.fee.toFixed(8)} BTC</p>
                          </div>
                        )}

                        {transaction.size > 0 && (
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <label className="text-sm text-gray-400 block mb-2">Transaction Size</label>
                            <p className="text-white font-medium text-lg">{transaction.size} bytes</p>
                          </div>
                        )}

                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <label className="text-sm text-gray-400 block mb-2">Confirmations</label>
                          <p className="text-white font-medium text-lg">{transaction.confirmations}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Inputs */}
                        {transaction.inputs && transaction.inputs.length > 0 && (
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <h3 className="text-white font-medium mb-4 text-lg">Inputs ({transaction.inputs.length})</h3>
                            <div className="space-y-4 max-h-48 overflow-y-auto">
                              {transaction.inputs.map((input, index) => (
                                <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                                  <div className="space-y-2">
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-gray-400 text-sm">Address:</span>
                                      <code className="text-blue-400 text-xs break-all bg-gray-800 px-2 py-1 rounded">
                                        {input.address}
                                      </code>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-gray-400 text-sm">Value:</span>
                                      <span className="text-white font-medium">{input.value.toFixed(8)} BTC</span>
                                    </div>
                                  </div>
                                  {index < transaction.inputs.length - 1 && <hr className="border-gray-600 my-3" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outputs */}
                        {transaction.outputs && transaction.outputs.length > 0 && (
                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <h3 className="text-white font-medium mb-4 text-lg">Outputs ({transaction.outputs.length})</h3>
                            <div className="space-y-4 max-h-48 overflow-y-auto">
                              {transaction.outputs.map((output, index) => (
                                <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                                  <div className="space-y-2">
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-gray-400 text-sm">Address:</span>
                                      <code className="text-green-400 text-xs break-all bg-gray-800 px-2 py-1 rounded">
                                        {output.address}
                                      </code>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-gray-400 text-sm">Value:</span>
                                      <span className="text-white font-medium">{output.value.toFixed(8)} BTC</span>
                                    </div>
                                  </div>
                                  {index < transaction.outputs.length - 1 && <hr className="border-gray-600 my-3" />}
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

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerSimple
          onScan={handleQRScan}
          onClose={handleQRClose}
          onError={handleQRError}
        />
      )}
    </div>
  )
}