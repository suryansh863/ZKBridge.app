import axios from 'axios'
import { BridgeTransaction, BitcoinTransaction, EthereumTransaction, ZKProof, MerkleProof } from '@zkbridge/shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// Bridge API
export const bridgeApi = {
  // Get all transactions
  getTransactions: (params?: {
    page?: number
    limit?: number
    status?: string
    direction?: string
  }) => api.get('/api/bridge', { params }),

  // Get transaction by ID
  getTransaction: (id: string) => api.get(`/api/bridge/${id}`),

  // Create new transaction
  createTransaction: (data: {
    direction: string
    sourceTxHash: string
    sourceAmount: string
    sourceAddress: string
    targetAddress: string
    userId?: string
  }) => api.post('/api/bridge', data),

  // Update transaction status
  updateTransactionStatus: (id: string, data: any) => 
    api.patch(`/api/bridge/${id}/status`, data),
}

// Bitcoin API
export const bitcoinApi = {
  // Get transaction details
  getTransaction: (txid: string) => api.get(`/api/bitcoin/transaction/${txid}`),

  // Verify transaction
  verifyTransaction: (data: {
    txid: string
    address: string
    amount: number
  }) => api.post('/api/bitcoin/verify', data),

  // Generate Merkle proof
  generateMerkleProof: (data: {
    txid: string
    blockHash: string
  }) => api.post('/api/bitcoin/merkle-proof', data),

  // Verify Merkle proof
  verifyMerkleProof: (data: {
    leaf: string
    path: string[]
    indices: number[]
    root: string
  }) => api.post('/api/bitcoin/verify-merkle-proof', data),

  // Get network info
  getNetworkInfo: () => api.get('/api/bitcoin/network-info'),

  // Get balance
  getBalance: (address: string) => api.get(`/api/bitcoin/balance/${address}`),
}

// Ethereum API
export const ethereumApi = {
  // Get transaction details
  getTransaction: (hash: string) => api.get(`/api/ethereum/transaction/${hash}`),

  // Verify transaction
  verifyTransaction: (data: {
    hash: string
    address: string
    amount: string
  }) => api.post('/api/ethereum/verify', data),

  // Get network info
  getNetworkInfo: () => api.get('/api/ethereum/network-info'),

  // Get balance
  getBalance: (address: string) => api.get(`/api/ethereum/balance/${address}`),

  // Get gas price
  getGasPrice: () => api.get('/api/ethereum/gas-price'),

  // Estimate gas
  estimateGas: (data: {
    to: string
    value: string
    data?: string
  }) => api.post('/api/ethereum/estimate-gas', data),
}

// ZK Proof API
export const zkApi = {
  // Generate proof
  generateProof: (data: {
    secret: string
    publicInput: string
  }) => api.post('/api/zk/generate-proof', data),

  // Verify proof
  verifyProof: (data: {
    proof: any
    publicSignals: string[]
  }) => api.post('/api/zk/verify-proof', data),

  // Generate witness
  generateWitness: (data: {
    inputs: any
  }) => api.post('/api/zk/generate-witness', data),

  // Get circuit info
  getCircuitInfo: () => api.get('/api/zk/circuit-info'),

  // Demo proof of knowledge
  demoProofOfKnowledge: (data: {
    secret: string
  }) => api.post('/api/zk/demo/proof-of-knowledge', data),
}

// Health API
export const healthApi = {
  // Get API health
  getHealth: () => api.get('/api/health'),

  // Get database health
  getDatabaseHealth: () => api.get('/api/health/database'),
}

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Export the main api instance for custom requests
export default api

