"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRightLeft, 
  ExternalLink,
  Copy,
  Filter,
  Search,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn, formatAddress, formatTimeAgo } from '@/lib/utils';

interface Transaction {
  id: string;
  from: 'Bitcoin' | 'Ethereum';
  to: 'Bitcoin' | 'Ethereum';
  amount: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  timestamp: number;
  txHash: string;
  recipientAddress: string;
  bridgeFee: string;
}

interface TransactionHistoryProps {
  className?: string;
}

export function TransactionHistory({ className }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        from: 'Bitcoin',
        to: 'Ethereum',
        amount: '0.5',
        status: 'completed',
        timestamp: Date.now() - 3600000, // 1 hour ago
        txHash: '0x1234567890abcdef1234567890abcdef12345678',
        recipientAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        bridgeFee: '0.01',
      },
      {
        id: '2',
        from: 'Ethereum',
        to: 'Bitcoin',
        amount: '2.1',
        status: 'processing',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        txHash: '0xabcd1234567890ef1234567890abcdef1234567890',
        recipientAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        bridgeFee: '0.042',
      },
      {
        id: '3',
        from: 'Bitcoin',
        to: 'Ethereum',
        amount: '1.0',
        status: 'pending',
        timestamp: Date.now() - 900000, // 15 minutes ago
        txHash: 'btc-tx-hash-1234567890abcdef',
        recipientAddress: '0x9876543210fedcba9876543210fedcba98765432',
        bridgeFee: '0.02',
      },
      {
        id: '4',
        from: 'Ethereum',
        to: 'Bitcoin',
        amount: '0.8',
        status: 'failed',
        timestamp: Date.now() - 7200000, // 2 hours ago
        txHash: '0x9876543210fedcba9876543210fedcba9876543210',
        recipientAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        bridgeFee: '0.016',
      },
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter transactions based on search and status
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter]);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'processing':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <section className={cn("py-20 px-4", className)}>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Loading transactions...</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-20 px-4", className)}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-bitcoin to-ethereum bg-clip-text text-transparent">
            Transaction History
          </h2>
          <p className="text-xl text-muted-foreground">
            Track your bridge transactions and their status
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={cn(
            "p-6 rounded-3xl",
            "glass-card border border-white/20",
            "shadow-2xl"
          )}
        >
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by hash, address, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl",
                  "glass border border-white/10",
                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-300"
                )}
              />
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  "appearance-none pl-4 pr-10 py-3 rounded-xl min-w-[150px]",
                  "glass border border-white/10",
                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-300"
                )}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start bridging your assets to see transaction history here.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "group p-6 rounded-2xl transition-all duration-300",
                      "glass border border-white/10",
                      "hover:border-white/20 hover:shadow-lg",
                      "interactive"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Transaction Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(tx.status)}
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                              getStatusColor(tx.status)
                            )}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatTimeAgo(tx.timestamp)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              tx.from === 'Bitcoin' ? 'bg-bitcoin text-white' : 'bg-ethereum text-white'
                            )}>
                              {tx.from === 'Bitcoin' ? 'B' : 'E'}
                            </div>
                            <span className="font-medium">{tx.from}</span>
                          </div>
                          
                          <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                          
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              tx.to === 'Bitcoin' ? 'bg-bitcoin text-white' : 'bg-ethereum text-white'
                            )}>
                              {tx.to === 'Bitcoin' ? 'B' : 'E'}
                            </div>
                            <span className="font-medium">{tx.to}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-semibold">
                              {tx.amount} {tx.from === 'Bitcoin' ? 'BTC' : 'ETH'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Bridge Fee</span>
                            <span className="text-sm">
                              {tx.bridgeFee} {tx.from === 'Bitcoin' ? 'BTC' : 'ETH'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Recipient</span>
                            <span className="font-mono text-xs">
                              {formatAddress(tx.recipientAddress, 6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Hash and Actions */}
                      <div className="flex flex-col gap-4 lg:w-80">
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Transaction Hash</span>
                          <div className="flex items-center gap-2 p-3 rounded-xl glass border border-white/10">
                            <span className="font-mono text-xs flex-1 truncate">
                              {formatAddress(tx.txHash, 8)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(tx.txHash)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className={cn(
                            "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300",
                            "glass border border-white/20",
                            "hover:border-white/30 hover:scale-105"
                          )}>
                            <ExternalLink className="h-4 w-4 inline mr-2" />
                            View
                          </button>
                          {tx.status === 'failed' && (
                            <button className={cn(
                              "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300",
                              "bg-gradient-to-r from-primary to-primary/80 text-white",
                              "hover:from-primary/90 hover:to-primary/70 hover:scale-105"
                            )}>
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Load More Button */}
          {filteredTransactions.length > 0 && (
            <div className="mt-8 text-center">
              <button className={cn(
                "px-8 py-3 rounded-xl font-medium transition-all duration-300",
                "glass border border-white/20",
                "hover:border-white/30 hover:scale-105 interactive"
              )}>
                Load More Transactions
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}