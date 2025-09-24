// Contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
  BRIDGE_CONTRACT: process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || '0x...',
  WRAPPED_BTC: process.env.NEXT_PUBLIC_WRAPPED_BTC_ADDRESS || '0x...',
  BTC_RELAY: process.env.NEXT_PUBLIC_BTC_RELAY_ADDRESS || '0x...',
} as const;

// Contract types
export interface BridgeContract {
  address: string;
  abi: any[];
}

export interface WrappedBTC {
  address: string;
  abi: any[];
}

export interface BTCRelay {
  address: string;
  abi: any[];
}

// Export contract instances
export const BridgeContract: BridgeContract = {
  address: CONTRACT_ADDRESSES.BRIDGE_CONTRACT,
  abi: [], // Will be populated with actual ABI
};

export const WrappedBTC: WrappedBTC = {
  address: CONTRACT_ADDRESSES.WRAPPED_BTC,
  abi: [], // Will be populated with actual ABI
};

export const BTCRelay: BTCRelay = {
  address: CONTRACT_ADDRESSES.BTC_RELAY,
  abi: [], // Will be populated with actual ABI
};

