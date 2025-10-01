"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, ArrowRight, ExternalLink, Copy, Eye, Filter, RefreshCw } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { apiClient, BridgeTransaction } from '@/lib/api-client'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<string>('all')

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getAllBridgeTransactions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        direction: directionFilter !== 'all' ? directionFilter : undefined,
        limit: 50,
        offset: 0,
      })

      if (response.success && response.data) {
        setTransactions(response.data)
      } else {
        setError(response.error || 'Failed to load transactions')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'PENDING':
      case 'VERIFYING':
      case 'PROOF_GENERATED':
      case 'SUBMITTING':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'FAILED':
        return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'PENDING':
      case 'VERIFYING':
      case 'PROOF_GENERATED':
      case 'SUBMITTING':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    return num.toFixed(8)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Bridge Transactions</h1>
            <p className="text-muted-foreground">
              View all Bitcoin-Ethereum bridge transactions and their status
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFYING">Verifying</option>
              <option value="PROOF_GENERATED">Proof Generated</option>
              <option value="SUBMITTING">Submitting</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Directions</option>
              <option value="BITCOIN_TO_ETHEREUM">Bitcoin → Ethereum</option>
              <option value="ETHEREUM_TO_BITCOIN">Ethereum → Bitcoin</option>
            </select>

            <button
              onClick={loadTransactions}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-2">No transactions found</p>
                <p className="text-muted-foreground text-sm">
                  {statusFilter !== 'all' || directionFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start by bridging some Bitcoin on the bridge page'}
                </p>
              </div>
            ) : (
              transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-lg p-6 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">
                            {tx.direction === 'BITCOIN_TO_ETHEREUM' ? 'Bitcoin → Ethereum' : 'Ethereum → Bitcoin'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(tx.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy transaction ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {tx.sourceTxHash && (
                        <a
                          href={`https://blockstream.info/testnet/tx/${tx.sourceTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="View on blockchain explorer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Source Transaction</p>
                      <p className="text-sm font-mono text-foreground truncate" title={tx.sourceTxHash}>
                        {tx.sourceTxHash}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatAmount(tx.sourceAmount)} BTC
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Source Address</p>
                      <p className="text-sm font-mono text-foreground truncate" title={tx.sourceAddress}>
                        {tx.sourceAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Target Address</p>
                      <p className="text-sm font-mono text-foreground truncate" title={tx.targetAddress}>
                        {tx.targetAddress}
                      </p>
                    </div>
                  </div>

                  {tx.targetTxHash && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Target Transaction</p>
                      <p className="text-sm font-mono text-foreground truncate" title={tx.targetTxHash}>
                        {tx.targetTxHash}
                      </p>
                    </div>
                  )}

                  {tx.errorMessage && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-red-400">
                        <span className="font-medium">Error:</span> {tx.errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Confirmations: {tx.confirmations}</span>
                      {tx.blockHeight && <span>Block: {tx.blockHeight}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDate(tx.updatedAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}