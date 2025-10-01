/**
 * API Client for BridgeSpark Backend
 * Provides typed methods for all backend API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface BridgeTransaction {
  id: string;
  direction: 'BITCOIN_TO_ETHEREUM' | 'ETHEREUM_TO_BITCOIN';
  status: string;
  sourceTxHash: string;
  sourceAmount: string;
  sourceAddress: string;
  targetTxHash?: string;
  targetAmount?: string;
  targetAddress: string;
  zkProof?: string;
  zkProofHash?: string;
  merkleProof?: string;
  merkleRoot?: string;
  blockHeight?: number;
  blockHash?: string;
  confirmations: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEvent {
  id: string;
  transactionId: string;
  eventType: string;
  eventData?: string;
  message?: string;
  createdAt: string;
}

export interface BridgeStatistics {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  totalVolume: string;
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Bridge Transaction APIs
  async createBridgeTransaction(params: {
    direction: 'BITCOIN_TO_ETHEREUM' | 'ETHEREUM_TO_BITCOIN';
    sourceTxHash: string;
    sourceAmount: string;
    sourceAddress: string;
    targetAddress: string;
    userId?: string;
  }): Promise<ApiResponse<BridgeTransaction>> {
    return this.request<BridgeTransaction>('/api/bridge/transactions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getBridgeTransaction(id: string): Promise<ApiResponse<BridgeTransaction>> {
    return this.request<BridgeTransaction>(`/api/bridge/transactions/${id}`);
  }

  async getBridgeTransactionByHash(sourceTxHash: string): Promise<ApiResponse<BridgeTransaction>> {
    return this.request<BridgeTransaction>(`/api/bridge/transactions/hash/${sourceTxHash}`);
  }

  async getAllBridgeTransactions(filters?: {
    status?: string;
    direction?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<BridgeTransaction[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.direction) params.append('direction', filters.direction);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const query = params.toString();
    return this.request<BridgeTransaction[]>(`/api/bridge/transactions${query ? `?${query}` : ''}`);
  }

  async processBridgeTransaction(id: string): Promise<ApiResponse<BridgeTransaction>> {
    return this.request<BridgeTransaction>(`/api/bridge/transactions/${id}/process`, {
      method: 'POST',
    });
  }

  async getTransactionEvents(id: string): Promise<ApiResponse<TransactionEvent[]>> {
    return this.request<TransactionEvent[]>(`/api/bridge/transactions/${id}/events`);
  }

  async getBridgeStatistics(): Promise<ApiResponse<BridgeStatistics>> {
    return this.request<BridgeStatistics>('/api/bridge/statistics');
  }

  // Bitcoin APIs
  async getSampleTransactions(): Promise<ApiResponse<Array<{ txHash: string; description: string }>>> {
    return this.request('/api/bitcoin/sample-transactions');
  }

  async getBitcoinTransaction(txid: string): Promise<ApiResponse<any>> {
    return this.request(`/api/bitcoin/detailed-transaction/${txid}`);
  }

  async verifyBitcoinTransaction(params: {
    txid: string;
    address: string;
    amount: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/bitcoin/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async generateMerkleProof(txid: string): Promise<ApiResponse<any>> {
    return this.request(`/api/bitcoin/merkle-proof/${txid}`);
  }

  // ZK Proof APIs
  async generateZKProof(params: {
    transactionHash: string;
    merkleProof: string[];
    merkleRoot: string;
    blockHeight: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/zk/generate-proof', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async verifyZKProof(params: {
    proof: any;
    publicSignals: string[];
  }): Promise<ApiResponse<{ isValid: boolean }>> {
    return this.request('/api/zk/verify-proof', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/api/health');
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for custom instances
export default APIClient;
