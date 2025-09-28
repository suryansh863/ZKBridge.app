/**
 * Wallet Error Handler Utility
 * Provides comprehensive error handling for wallet operations
 */

export interface WalletError {
  code: string;
  message: string;
  originalError?: any;
  timestamp: Date;
}

export class WalletErrorHandler {
  /**
   * Handle common wallet errors and provide user-friendly messages
   */
  static handleError(error: any): WalletError {
    const timestamp = new Date();
    
    // Handle specific error codes
    if (error.code) {
      switch (error.code) {
        case 4001:
          return {
            code: 'USER_REJECTED',
            message: 'Connection request was rejected. Please approve the connection in your wallet.',
            originalError: error,
            timestamp
          };
        
        case 4100:
          return {
            code: 'UNAUTHORIZED',
            message: 'The requested method is not authorized. Please check your wallet permissions.',
            originalError: error,
            timestamp
          };
        
        case 4200:
          return {
            code: 'UNSUPPORTED_METHOD',
            message: 'The requested method is not supported by your wallet.',
            originalError: error,
            timestamp
          };
        
        case 4900:
          return {
            code: 'DISCONNECTED',
            message: 'Wallet is not connected to the requested network. Please switch networks.',
            originalError: error,
            timestamp
          };
        
        case 4901:
          return {
            code: 'CHAIN_DISCONNECTED',
            message: 'Wallet is not connected to the requested chain.',
            originalError: error,
            timestamp
          };
        
        default:
          return {
            code: `WALLET_ERROR_${error.code}`,
            message: error.message || 'An unknown wallet error occurred.',
            originalError: error,
            timestamp
          };
      }
    }
    
    // Handle error messages
    if (error.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('message port closed')) {
        return {
          code: 'PORT_CLOSED',
          message: 'Wallet extension connection was interrupted. Please ensure your wallet is running and try again.',
          originalError: error,
          timestamp
        };
      }
      
      if (message.includes('user denied') || message.includes('user rejected')) {
        return {
          code: 'USER_DENIED',
          message: 'Connection was denied. Please approve the connection in your wallet.',
          originalError: error,
          timestamp
        };
      }
      
      if (message.includes('not installed')) {
        return {
          code: 'NOT_INSTALLED',
          message: 'Wallet extension is not installed. Please install the required wallet extension.',
          originalError: error,
          timestamp
        };
      }
      
      if (message.includes('network') || message.includes('chain')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network connection error. Please check your network and try again.',
          originalError: error,
          timestamp
        };
      }
      
      if (message.includes('timeout')) {
        return {
          code: 'TIMEOUT',
          message: 'Connection timed out. Please try again.',
          originalError: error,
          timestamp
        };
      }
      
      if (message.includes('insufficient funds')) {
        return {
          code: 'INSUFFICIENT_FUNDS',
          message: 'Insufficient funds for this transaction. Please add funds to your wallet.',
          originalError: error,
          timestamp
        };
      }
      
      if (message.includes('gas')) {
        return {
          code: 'GAS_ERROR',
          message: 'Gas estimation failed. Please try increasing the gas limit.',
          originalError: error,
          timestamp
        };
      }
    }
    
    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred. Please try again.',
      originalError: error,
      timestamp
    };
  }
  
  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: WalletError): boolean {
    const recoverableCodes = [
      'PORT_CLOSED',
      'TIMEOUT',
      'NETWORK_ERROR',
      'GAS_ERROR'
    ];
    
    return recoverableCodes.includes(error.code);
  }
  
  /**
   * Get retry delay for specific error types
   */
  static getRetryDelay(error: WalletError): number {
    switch (error.code) {
      case 'PORT_CLOSED':
        return 2000; // 2 seconds
      case 'TIMEOUT':
        return 3000; // 3 seconds
      case 'NETWORK_ERROR':
        return 5000; // 5 seconds
      case 'GAS_ERROR':
        return 1000; // 1 second
      default:
        return 0; // No retry
    }
  }
  
  /**
   * Get user action required for specific error types
   */
  static getUserAction(error: WalletError): string | null {
    switch (error.code) {
      case 'USER_REJECTED':
      case 'USER_DENIED':
        return 'Please approve the connection in your wallet';
      case 'NOT_INSTALLED':
        return 'Please install the required wallet extension';
      case 'UNAUTHORIZED':
        return 'Please check your wallet permissions';
      case 'DISCONNECTED':
      case 'CHAIN_DISCONNECTED':
        return 'Please connect to the correct network';
      case 'INSUFFICIENT_FUNDS':
        return 'Please add funds to your wallet';
      default:
        return null;
    }
  }
  
  /**
   * Log error for debugging
   */
  static logError(error: WalletError, context: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Wallet Error: ${error.code}`);
      console.error('Context:', context);
      console.error('Message:', error.message);
      console.error('Timestamp:', error.timestamp);
      if (error.originalError) {
        console.error('Original Error:', error.originalError);
      }
      console.groupEnd();
    }
  }
  
  /**
   * Create error notification data
   */
  static createNotificationData(error: WalletError) {
    return {
      type: 'error' as const,
      title: 'Wallet Connection Error',
      message: error.message,
      duration: 8000,
      actions: this.isRecoverable(error) ? [
        {
          label: 'Try Again',
          action: () => window.location.reload(),
          variant: 'primary' as const
        }
      ] : undefined
    };
  }
}

/**
 * Safe wallet request wrapper
 */
export async function safeWalletRequest<T>(
  request: () => Promise<T>,
  context: string = 'wallet operation'
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const walletError = WalletErrorHandler.handleError(error);
    WalletErrorHandler.logError(walletError, context);
    throw walletError;
  }
}

/**
 * Retry wrapper for wallet operations
 */
export async function retryWalletOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  context: string = 'wallet operation'
): Promise<T> {
  let lastError: WalletError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = WalletErrorHandler.handleError(error);
      WalletErrorHandler.logError(lastError, `${context} (attempt ${attempt})`);
      
      if (attempt === maxRetries || !WalletErrorHandler.isRecoverable(lastError)) {
        throw lastError;
      }
      
      const delay = WalletErrorHandler.getRetryDelay(lastError);
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || WalletErrorHandler.handleError(new Error('Max retries exceeded'));
}


