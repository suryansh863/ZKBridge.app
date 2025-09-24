import { z } from 'zod';

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  COMPLETED = 'completed'
}

// Bridge direction enum
export enum BridgeDirection {
  BITCOIN_TO_ETHEREUM = 'bitcoin_to_ethereum',
  ETHEREUM_TO_BITCOIN = 'ethereum_to_bitcoin'
}

// Bitcoin transaction schema
export const BitcoinTransactionSchema = z.object({
  txid: z.string(),
  amount: z.number().positive(),
  fromAddress: z.string(),
  toAddress: z.string(),
  blockHeight: z.number().optional(),
  confirmations: z.number().min(0),
  timestamp: z.number(),
  merkleProof: z.string().optional(),
  merkleRoot: z.string().optional()
});

export type BitcoinTransaction = z.infer<typeof BitcoinTransactionSchema>;

// Ethereum transaction schema
export const EthereumTransactionSchema = z.object({
  hash: z.string(),
  amount: z.string(), // BigInt as string
  fromAddress: z.string(),
  toAddress: z.string(),
  blockNumber: z.number().optional(),
  confirmations: z.number().min(0),
  timestamp: z.number(),
  gasUsed: z.string().optional(),
  gasPrice: z.string().optional()
});

export type EthereumTransaction = z.infer<typeof EthereumTransactionSchema>;

// Bridge transaction schema
export const BridgeTransactionSchema = z.object({
  id: z.string(),
  direction: z.nativeEnum(BridgeDirection),
  status: z.nativeEnum(TransactionStatus),
  sourceTransaction: z.union([BitcoinTransactionSchema, EthereumTransactionSchema]),
  targetTransaction: z.union([BitcoinTransactionSchema, EthereumTransactionSchema]).optional(),
  zkProof: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  userId: z.string().optional()
});

export type BridgeTransaction = z.infer<typeof BridgeTransactionSchema>;

// ZK Proof schema
export const ZKProofSchema = z.object({
  proof: z.object({
    pi_a: z.array(z.string()),
    pi_b: z.array(z.array(z.string())),
    pi_c: z.array(z.string())
  }),
  publicSignals: z.array(z.string())
});

export type ZKProof = z.infer<typeof ZKProofSchema>;

// Merkle proof schema
export const MerkleProofSchema = z.object({
  leaf: z.string(),
  path: z.array(z.string()),
  indices: z.array(z.number()),
  root: z.string()
});

export type MerkleProof = z.infer<typeof MerkleProofSchema>;

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Wallet connection schema
export const WalletConnectionSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  isConnected: z.boolean(),
  balance: z.string().optional()
});

export type WalletConnection = z.infer<typeof WalletConnectionSchema>;

