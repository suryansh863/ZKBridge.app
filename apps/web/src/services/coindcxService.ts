/**
 * CoinDCX API Service for BridgeSpark
 * Handles secure integration with CoinDCX exchange API
 */

import { 
  CoinDCXCredentials, 
  CoinDCXAccount, 
  CoinDCXBalance, 
  CoinDCXOrder,
  CoinDCXTransaction,
  CoinDCXApiResponse,
  ExchangeApiConfig
} from '@/types/wallet';

class CoinDCXService {
  private baseUrl: string;
  private credentials: CoinDCXCredentials | null = null;
  private isTestnet: boolean = false;

  constructor() {
    this.baseUrl = 'https://api.coindcx.com';
  }

  /**
   * Initialize service with credentials
   */
  initialize(credentials: CoinDCXCredentials): void {
    this.credentials = credentials;
    this.isTestnet = credentials.isTestnet || false;
    
    if (this.isTestnet) {
      this.baseUrl = 'https://api-sandbox.coindcx.com';
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<CoinDCXApiResponse<CoinDCXAccount>> {
    if (!this.credentials) {
      throw new Error('CoinDCX credentials not initialized');
    }

    try {
      const account = await this.getAccountInfo();
      return {
        success: true,
        data: account
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONNECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<CoinDCXAccount> {
    const response = await this.makeAuthenticatedRequest('/exchange/v1/users/me');
    
    return {
      id: response.id,
      email: response.email,
      balances: await this.getBalances(),
      tradingEnabled: response.trading_enabled,
      kycStatus: response.kyc_status
    };
  }

  /**
   * Get account balances
   */
  async getBalances(): Promise<CoinDCXBalance[]> {
    const response = await this.makeAuthenticatedRequest('/exchange/v1/users/balances');
    
    return response.map((balance: any) => ({
      currency: balance.currency,
      balance: balance.balance,
      available: balance.available,
      locked: balance.locked,
      usdValue: balance.usd_value || 0
    }));
  }

  /**
   * Get specific currency balance
   */
  async getBalance(currency: string): Promise<CoinDCXBalance | null> {
    const balances = await this.getBalances();
    return balances.find(b => b.currency === currency) || null;
  }

  /**
   * Get trading pairs
   */
  async getTradingPairs(): Promise<any[]> {
    const response = await this.makePublicRequest('/exchange/v1/markets');
    return response;
  }

  /**
   * Get market data
   */
  async getMarketData(symbol?: string): Promise<any> {
    const endpoint = symbol 
      ? `/exchange/v1/markets/${symbol}` 
      : '/exchange/v1/markets';
    
    return await this.makePublicRequest(endpoint);
  }

  /**
   * Get order book
   */
  async getOrderBook(symbol: string): Promise<any> {
    return await this.makePublicRequest(`/exchange/v1/orders/${symbol}`);
  }

  /**
   * Get user orders
   */
  async getOrders(symbol?: string, status?: string): Promise<CoinDCXOrder[]> {
    const params = new URLSearchParams();
    if (symbol) params.append('symbol', symbol);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `/exchange/v1/orders?${queryString}`
      : '/exchange/v1/orders';
    
    const response = await this.makeAuthenticatedRequest(endpoint);
    
    return response.map((order: any) => ({
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at)
    }));
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    quantity: string;
    price?: string;
  }): Promise<CoinDCXOrder> {
    const response = await this.makeAuthenticatedRequest('/exchange/v1/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    
    return {
      id: response.id,
      symbol: response.symbol,
      side: response.side,
      type: response.type,
      quantity: response.quantity,
      price: response.price,
      status: response.status,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at)
    };
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.makeAuthenticatedRequest(`/exchange/v1/orders/${orderId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(limit: number = 50, offset: number = 0): Promise<CoinDCXTransaction[]> {
    const response = await this.makeAuthenticatedRequest(
      `/exchange/v1/users/transactions?limit=${limit}&offset=${offset}`
    );
    
    return response.map((tx: any) => ({
      id: tx.id,
      type: tx.type,
      currency: tx.currency,
      amount: tx.amount,
      status: tx.status,
      txHash: tx.tx_hash,
      createdAt: new Date(tx.created_at)
    }));
  }

  /**
   * Get deposit address
   */
  async getDepositAddress(currency: string): Promise<string> {
    const response = await this.makeAuthenticatedRequest(
      `/exchange/v1/users/deposit_address?currency=${currency}`
    );
    
    return response.address;
  }

  /**
   * Withdraw funds
   */
  async withdraw(withdrawalData: {
    currency: string;
    amount: string;
    address: string;
    tag?: string;
  }): Promise<string> {
    const response = await this.makeAuthenticatedRequest('/exchange/v1/users/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawalData)
    });
    
    return response.id;
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawals(limit: number = 50, offset: number = 0): Promise<CoinDCXTransaction[]> {
    const response = await this.makeAuthenticatedRequest(
      `/exchange/v1/users/withdrawals?limit=${limit}&offset=${offset}`
    );
    
    return response.map((tx: any) => ({
      id: tx.id,
      type: 'withdrawal',
      currency: tx.currency,
      amount: tx.amount,
      status: tx.status,
      txHash: tx.tx_hash,
      createdAt: new Date(tx.created_at)
    }));
  }

  /**
   * Make authenticated API request
   */
  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.credentials) {
      throw new Error('CoinDCX credentials not initialized');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const timestamp = Date.now().toString();
    
    // Create signature for authentication
    const signature = await this.createSignature(endpoint, timestamp, options.body);
    
    const headers = {
      'Content-Type': 'application/json',
      'X-AUTH-APIKEY': this.credentials.apiKey,
      'X-AUTH-SIGNATURE': signature,
      'X-AUTH-TIMESTAMP': timestamp,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Make public API request
   */
  private async makePublicRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create API signature for authentication
   */
  private async createSignature(endpoint: string, timestamp: string, body?: string): Promise<string> {
    if (!this.credentials) {
      throw new Error('CoinDCX credentials not initialized');
    }

    // Create the message to sign
    const message = `${endpoint}${timestamp}${body || ''}`;
    
    // In a real implementation, you would use HMAC-SHA256 to sign the message
    // For security reasons, this should be done on the backend
    // This is a simplified version for demonstration
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.credentials.apiSecret);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = new Uint8Array(signature);
    const signatureHex = Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signatureHex;
  }

  /**
   * Validate credentials format
   */
  static validateCredentials(credentials: CoinDCXCredentials): { valid: boolean; error?: string } {
    if (!credentials.apiKey || credentials.apiKey.length < 10) {
      return { valid: false, error: 'Invalid API Key' };
    }
    
    if (!credentials.apiSecret || credentials.apiSecret.length < 10) {
      return { valid: false, error: 'Invalid API Secret' };
    }
    
    return { valid: true };
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<string[]> {
    const markets = await this.getTradingPairs();
    const currencies = new Set<string>();
    
    markets.forEach((market: any) => {
      currencies.add(market.base_currency_short_name);
      currencies.add(market.quote_currency_short_name);
    });
    
    return Array.from(currencies);
  }

  /**
   * Get trading fees
   */
  async getTradingFees(): Promise<any> {
    return await this.makeAuthenticatedRequest('/exchange/v1/users/trading_fees');
  }

  /**
   * Get account summary
   */
  async getAccountSummary(): Promise<{
    totalBalance: number;
    totalBalanceUSD: number;
    currencies: CoinDCXBalance[];
  }> {
    const balances = await this.getBalances();
    const totalBalanceUSD = balances.reduce((sum, balance) => sum + balance.usdValue, 0);
    
    return {
      totalBalance: balances.length,
      totalBalanceUSD,
      currencies: balances
    };
  }
}

// Export singleton instance
export const coinDCXService = new CoinDCXService();
export default coinDCXService;


