// Contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
  // Localhost deployment addresses
  BRIDGE_CONTRACT: process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  WRAPPED_BTC: process.env.NEXT_PUBLIC_WRAPPED_BTC_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  BTC_RELAY: process.env.NEXT_PUBLIC_BTC_RELAY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  PROOF_VERIFIER: process.env.NEXT_PUBLIC_PROOF_VERIFIER_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
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

