/**
 * Real-time Transaction Status Hook
 * Provides real-time updates for bridge transaction status
 */

import { useState, useEffect, useCallback } from 'react'
import { apiClient, BridgeTransaction } from '@/lib/api-client'

interface UseTransactionStatusOptions {
  transactionId?: string
  pollInterval?: number
  enabled?: boolean
}

export function useTransactionStatus(options: UseTransactionStatusOptions = {}) {
  const {
    transactionId,
    pollInterval = 5000, // 5 seconds
    enabled = true
  } = options

  const [transaction, setTransaction] = useState<BridgeTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchTransaction = useCallback(async () => {
    if (!transactionId) return

    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getBridgeTransaction(transactionId)

      if (response.success && response.data) {
        setTransaction(response.data)
        setLastUpdated(new Date())

        // If transaction is completed or failed, stop polling
        if (['COMPLETED', 'FAILED'].includes(response.data.status)) {
          return false // Stop polling
        }
      } else {
        setError(response.error || 'Failed to fetch transaction status')
      }

      return true // Continue polling
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch transaction status')
      return true // Continue polling on error
    } finally {
      setLoading(false)
    }
  }, [transactionId])

  // Initial load
  useEffect(() => {
    if (transactionId && enabled) {
      fetchTransaction()
    }
  }, [transactionId, enabled, fetchTransaction])

  // Polling effect
  useEffect(() => {
    if (!transactionId || !enabled) return

    const interval = setInterval(() => {
      fetchTransaction().then(shouldContinue => {
        if (!shouldContinue) {
          clearInterval(interval)
        }
      })
    }, pollInterval)

    return () => clearInterval(interval)
  }, [transactionId, enabled, pollInterval, fetchTransaction])

  const refresh = useCallback(() => {
    if (transactionId) {
      fetchTransaction()
    }
  }, [transactionId, fetchTransaction])

  return {
    transaction,
    loading,
    error,
    lastUpdated,
    refresh,
    isPolling: enabled && !!transactionId && !['COMPLETED', 'FAILED'].includes(transaction?.status || ''),
  }
}

// Hook for multiple transactions (like in transaction history)
export function useTransactionsStatus(transactionIds: string[], options: Omit<UseTransactionStatusOptions, 'transactionId'> = {}) {
  const [transactions, setTransactions] = useState<Map<string, BridgeTransaction>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (transactionIds.length === 0) return

    try {
      setLoading(true)
      setError(null)

      // Fetch all transactions in parallel
      const promises = transactionIds.map(id => apiClient.getBridgeTransaction(id))
      const results = await Promise.allSettled(promises)

      const newTransactions = new Map<string, BridgeTransaction>()

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          newTransactions.set(transactionIds[index], result.value.data)
        }
      })

      setTransactions(newTransactions)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [transactionIds])

  useEffect(() => {
    if (options.enabled !== false) {
      fetchTransactions()
    }
  }, [transactionIds, options.enabled, fetchTransactions])

  const refresh = useCallback(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    loading,
    error,
    refresh,
  }
}
