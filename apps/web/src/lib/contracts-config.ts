/**
 * Smart Contract Configuration
 * Central configuration for all deployed smart contracts
 */

export interface ContractAddresses {
  btcRelay: string;
  wrappedBTC: string;
  proofVerifier: string;
  bridgeContract: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  faucetUrl?: string;
}

// Sepolia Testnet Configuration
const SEPOLIA_CONFIG: NetworkConfig = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/' + (process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || ''),
  blockExplorer: 'https://sepolia.etherscan.io',
  faucetUrl: 'https://sepoliafaucet.com/'
};

// Contract Addresses for Sepolia Testnet
// These will be populated after deployment
const SEPOLIA_CONTRACTS: ContractAddresses = {
  btcRelay: process.env.NEXT_PUBLIC_BTC_RELAY_ADDRESS || '',
  wrappedBTC: process.env.NEXT_PUBLIC_WRAPPED_BTC_ADDRESS || '',
  proofVerifier: process.env.NEXT_PUBLIC_PROOF_VERIFIER_ADDRESS || '',
  bridgeContract: process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || '',
};

// Mainnet Configuration (for future use)
const MAINNET_CONFIG: NetworkConfig = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  rpcUrl: 'https://mainnet.infura.io/v3/' + (process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || ''),
  blockExplorer: 'https://etherscan.io',
};

const MAINNET_CONTRACTS: ContractAddresses = {
  btcRelay: '',
  wrappedBTC: '',
  proofVerifier: '',
  bridgeContract: '',
};

// Get current network configuration
export function getNetworkConfig(): NetworkConfig {
  const network = process.env.NEXT_PUBLIC_ETHEREUM_NETWORK || 'sepolia';
  
  switch (network.toLowerCase()) {
    case 'sepolia':
      return SEPOLIA_CONFIG;
    case 'mainnet':
      return MAINNET_CONFIG;
    default:
      return SEPOLIA_CONFIG;
  }
}

// Get contract addresses for current network
export function getContractAddresses(): ContractAddresses {
  const network = process.env.NEXT_PUBLIC_ETHEREUM_NETWORK || 'sepolia';
  
  switch (network.toLowerCase()) {
    case 'sepolia':
      return SEPOLIA_CONTRACTS;
    case 'mainnet':
      return MAINNET_CONTRACTS;
    default:
      return SEPOLIA_CONTRACTS;
  }
}

// Validate that contracts are configured
export function validateContractsConfigured(): boolean {
  const addresses = getContractAddresses();
  return !!(
    addresses.btcRelay &&
    addresses.wrappedBTC &&
    addresses.proofVerifier &&
    addresses.bridgeContract
  );
}

// Get block explorer URL for an address
export function getExplorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
  const config = getNetworkConfig();
  return `${config.blockExplorer}/${type}/${address}`;
}

// Contract ABIs will be loaded dynamically after deployment
// For now, they can be imported directly in components that need them
// Example: import BTCRelayABI from '../../../contracts/artifacts/contracts/BTCRelay.sol/BTCRelay.json'

// Placeholder for contract ABIs (will be populated after deployment)
export const contractABIs = {
  BTCRelay: null as any,
  WrappedBTC: null as any,
  ProofVerifier: null as any,
  BridgeContract: null as any,
};

// Export configuration
export const contractConfig = {
  network: getNetworkConfig(),
  addresses: getContractAddresses(),
  isConfigured: validateContractsConfigured(),
};
