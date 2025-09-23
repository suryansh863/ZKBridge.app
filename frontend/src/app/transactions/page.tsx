"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Eye, Clock, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react'
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

const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    type: 'bridge',
    status: 'confirmed',
    bitcoinTx: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    ethereumTx: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    amount: 0.001,
    timestamp: new Date('2024-01-15T10:30:00Z'),
    confirmations: 12,
    fee: 0.0001
  },
  {
    id: 'tx_002',
    type: 'bridge',
    status: 'pending',
    bitcoinTx: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    amount: 0.005,
    timestamp: new Date('2024-01-15T09:15:00Z'),
    confirmations: 3,
    fee: 0.0002
  },
  {
    id: 'tx_003',
    type: 'withdraw',
    status: 'confirmed',
    ethereumTx: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    amount: 0.002,
    timestamp: new Date('2024-01-14T16:45:00Z'),
    confirmations: 8,
    fee: 0.00015
  },
  {
    id: 'tx_004',
    type: 'deposit',
    status: 'failed',
    bitcoinTx: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
    amount: 0.003,
    timestamp: new Date('2024-01-14T14:20:00Z'),
    confirmations: 0,
    fee: 0.0003
  }
]

export default function TransactionsPage() {
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'bridge' | 'withdraw' | 'deposit'>('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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
            Transaction History
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="bridge">Bridge</option>
                <option value="withdraw">Withdraw</option>
                <option value="deposit">Deposit</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
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
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{transaction.id}</div>
                        <div className="text-sm text-gray-400">
                          {transaction.bitcoinTx ? 'BTC' : 'ETH'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {transaction.amount} BTC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
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
            <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-white">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
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
                <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-400">Transaction ID</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400 flex-1">
                        {selectedTransaction.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedTransaction.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Type</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(selectedTransaction.type)}`}>
                        {selectedTransaction.type}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="mt-1 flex items-center space-x-2">
                      {getStatusIcon(selectedTransaction.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Amount</label>
                    <p className="text-white font-medium mt-1">{selectedTransaction.amount} BTC</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Fee</label>
                    <p className="text-white font-medium mt-1">{selectedTransaction.fee} BTC</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Confirmations</label>
                    <p className="text-white font-medium mt-1">{selectedTransaction.confirmations}</p>
                  </div>
                </div>

                {selectedTransaction.bitcoinTx && (
                  <div>
                    <label className="text-sm text-gray-400">Bitcoin Transaction</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded text-orange-400 flex-1 break-all">
                        {selectedTransaction.bitcoinTx}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedTransaction.bitcoinTx!)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <a
                        href={`https://blockstream.info/tx/${selectedTransaction.bitcoinTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                )}

                {selectedTransaction.ethereumTx && (
                  <div>
                    <label className="text-sm text-gray-400">Ethereum Transaction</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400 flex-1 break-all">
                        {selectedTransaction.ethereumTx}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedTransaction.ethereumTx!)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <a
                        href={`https://etherscan.io/tx/${selectedTransaction.ethereumTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-400">Timestamp</label>
                  <p className="text-white font-medium mt-1">{formatDate(selectedTransaction.timestamp)}</p>
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

