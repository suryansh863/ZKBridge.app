
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Eye, Clock, CheckCircle, XCircle, ExternalLink, Copy, RefreshCw, ChevronDown } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface Transaction {
  id: string
  type: 'bridge' | 'withdraw' | 'deposit'
  status: 'pending' | 'confirmed' | 'failed'
  bitcoinTx?: string
  ethereumTx?: string
  amount: number
  timestamp: Date
  confirmations: number
  fee: number
}

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'bridge' | 'withdraw' | 'deposit'>('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load transactions from API
  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/bridge/transactions')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Transform API data to match our Transaction interface
          const transformedTransactions: Transaction[] = data.data.map((tx: any) => ({
            id: tx.id,
            type: 'bridge',
            status: tx.status.toLowerCase() === 'completed' ? 'confirmed' :
              tx.status.toLowerCase() === 'pending' ? 'pending' : 'failed',
            bitcoinTx: tx.sourceTxHash,
            ethereumTx: tx.targetTxHash || undefined,
            amount: parseFloat(tx.sourceAmount) / 100000000, // Convert satoshis to BTC
            timestamp: new Date(tx.createdAt),
            confirmations: tx.confirmations || 0,
            fee: parseFloat(tx.fee || '0') / 100000000
          }))
          setTransactions(transformedTransactions)
        }
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      loadTransactions()
    }
  }, [mounted])

  // Refresh transactions when page becomes visible (e.g., returning from bridge completion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        loadTransactions()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [mounted])

  useEffect(() => {
    let filtered = transactions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.bitcoinTx?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.ethereumTx?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter)
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }, [transactions, searchTerm, statusFilter, typeFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-muted/20 text-muted-foreground border-border/30'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bridge':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'withdraw':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'deposit':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-muted/20 text-muted-foreground border-border/30'
    }
  }

  const formatDate = (date: Date) => {
    if (!mounted) return 'Loading...'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportTransactions = () => {
    const csvContent = [
      ['ID', 'Type', 'Status', 'Amount (BTC)', 'Timestamp', 'Confirmations', 'Fee'],
      ...filteredTransactions.map(tx => [
        tx.id,
        tx.type,
        tx.status,
        tx.amount,
        tx.timestamp.toISOString(),
        tx.confirmations,
        tx.fee
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-4">
            Transaction History
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track all your Bitcoin bridge transactions with real-time status updates
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="appearance-none pl-4 pr-10 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="appearance-none pl-4 pr-10 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="bridge">Bridge</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="deposit">Deposit</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={loadTransactions}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
              </button>

              {/* Export Button */}
              <button
                onClick={exportTransactions}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{transaction.id}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {transaction.bitcoinTx ? 'Bitcoin' : 'Ethereum'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {transaction.amount} BTC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-muted/20 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-muted text-foreground border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-foreground font-medium">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Transaction ID</label>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted border border-border/50 px-3 py-1.5 rounded-lg text-primary flex-1 break-all">
                        {selectedTransaction.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedTransaction.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors border border-border/50"
                        title="Copy ID"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(selectedTransaction.type)}`}>
                        {selectedTransaction.type}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                    <div className="mt-1 flex items-center space-x-2">
                      {getStatusIcon(selectedTransaction.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Amount</label>
                    <p className="text-foreground font-semibold">{selectedTransaction.amount} BTC</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Fee</label>
                    <p className="text-foreground font-semibold">{selectedTransaction.fee} BTC</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Confirmations</label>
                    <p className="text-foreground font-semibold">{selectedTransaction.confirmations}</p>
                  </div>
                </div>

                {selectedTransaction.bitcoinTx && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Bitcoin Transaction</label>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted border border-border/50 px-3 py-1.5 rounded-lg text-primary flex-1 break-all font-mono">
                        {selectedTransaction.bitcoinTx}
                      </code>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => copyToClipboard(selectedTransaction.bitcoinTx!)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors border border-border/50"
                          title="Copy TX Hash"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <a
                          href={`https://blockstream.info/tx/${selectedTransaction.bitcoinTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-muted rounded-lg transition-colors border border-border/50"
                          title="View on Explorer"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTransaction.ethereumTx && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Ethereum Transaction</label>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted border border-border/50 px-3 py-1.5 rounded-lg text-primary flex-1 break-all font-mono">
                        {selectedTransaction.ethereumTx}
                      </code>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => copyToClipboard(selectedTransaction.ethereumTx!)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors border border-border/50"
                          title="Copy TX Hash"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <a
                          href={`https://etherscan.io/tx/${selectedTransaction.ethereumTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-muted rounded-lg transition-colors border border-border/50"
                          title="View on Explorer"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground">Timestamp</label>
                  <p className="text-foreground font-medium mt-1">{formatDate(selectedTransaction.timestamp)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

