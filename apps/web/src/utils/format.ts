/**
 * Utility functions for formatting wallet data
 */

/**
 * Format Ethereum address for display
 */
export function formatAddress(address: string, length: number = 6): string {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Format balance for display
 */
export function formatBalance(balance: string | number, decimals: number = 4): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  
  return num.toFixed(decimals);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Format transaction hash
 */
export function formatTxHash(hash: string, length: number = 8): string {
  if (!hash) return '';
  if (hash.length <= length * 2) return hash;
  
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format network name
 */
export function formatNetworkName(chainId: number): string {
  switch (chainId) {
    case 1: return 'Ethereum Mainnet';
    case 3: return 'Ropsten Testnet';
    case 4: return 'Rinkeby Testnet';
    case 5: return 'Goerli Testnet';
    case 42: return 'Kovan Testnet';
    case 137: return 'Polygon Mainnet';
    case 80001: return 'Polygon Mumbai';
    case 42161: return 'Arbitrum One';
    case 421611: return 'Arbitrum Rinkeby';
    case 10: return 'Optimism';
    case 69: return 'Optimism Kovan';
    case 8453: return 'Base';
    case 84531: return 'Base Goerli';
    default: return `Chain ${chainId}`;
  }
}

/**
 * Format network color
 */
export function formatNetworkColor(chainId: number): string {
  switch (chainId) {
    case 1: return 'text-blue-400';
    case 137: return 'text-purple-400';
    case 42161: return 'text-cyan-400';
    case 10: return 'text-red-400';
    case 8453: return 'text-blue-300';
    default: return 'text-gray-400';
  }
}

/**
 * Format wallet type for display
 */
export function formatWalletType(type: string): string {
  switch (type) {
    case 'metamask': return 'MetaMask';
    case 'coinbase': return 'Coinbase Wallet';
    case 'trust': return 'Trust Wallet';
    case 'walletconnect': return 'WalletConnect';
    case 'exodus': return 'Exodus';
    case 'coindcx': return 'CoinDCX';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

/**
 * Format connection status
 */
export function formatConnectionStatus(status: string): string {
  switch (status) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting...';
    case 'disconnected': return 'Disconnected';
    case 'error': return 'Error';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'An unknown error occurred';
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format gas price
 */
export function formatGasPrice(gasPrice: string | number): string {
  const price = typeof gasPrice === 'string' ? parseInt(gasPrice, 16) : gasPrice;
  const gwei = price / 1e9;
  
  if (gwei < 1) return `${gwei.toFixed(2)} Gwei`;
  if (gwei < 10) return `${gwei.toFixed(1)} Gwei`;
  return `${Math.round(gwei)} Gwei`;
}

/**
 * Format block number
 */
export function formatBlockNumber(blockNumber: string | number): string {
  const block = typeof blockNumber === 'string' ? parseInt(blockNumber, 16) : blockNumber;
  return block.toLocaleString();
}


