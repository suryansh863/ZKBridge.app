export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export enum BridgeDirection {
  BITCOIN_TO_ETHEREUM = 'bitcoin_to_ethereum',
  ETHEREUM_TO_BITCOIN = 'ethereum_to_bitcoin'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface BridgeTransaction {
  id: string;
  direction: BridgeDirection;
  status: TransactionStatus;
  amount: string;
  btcTxHash?: string;
  ethTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  btcAddress?: string;
  ethAddress?: string;
}

export interface BitcoinTransaction {
  txHash: string;
  blockHash: string;
  blockHeight: number;
  confirmations: number;
  inputs: BitcoinInput[];
  outputs: BitcoinOutput[];
  fee: number;
  timestamp: number;
}

export interface BitcoinInput {
  address: string;
  amount: number;
  txHash: string;
  outputIndex: number;
}

export interface BitcoinOutput {
  address: string;
  amount: number;
}

export interface MerkleProof {
  txHash: string;
  blockHash: string;
  merkleRoot: string;
  path: string[];
  index: number;
}

export interface EthereumTransaction {
  txHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPrice: string;
  timestamp: number;
}

export interface ZKProof {
  circuitId: string;
  proof: string;
  publicInputs: string[];
  verificationKey: string;
}

// Utility functions
export function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function sha256(data: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateMerkleProof(txHash: string, siblings: string[], index: number): MerkleProof {
  return {
    txHash,
    blockHash: '',
    merkleRoot: '',
    path: siblings,
    index
  };
}

export function verifyMerkleProof(proof: MerkleProof): boolean {
  // Simplified verification - in real implementation would verify against merkle root
  return proof.path.length > 0 && proof.index >= 0;
}
