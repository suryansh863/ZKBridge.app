export interface BitcoinTransaction {
  txHash: string;
  merkleRoot: string;
  merkleProof: string[];
  proofIndex: number;
  blockHeight: number;
  blockHash: string;
  inputs: Array<{
    address: string;
    amount: string;
    txHash: string;
    outputIndex: number;
  }>;
  outputs: Array<{
    address: string;
    amount: string;
  }>;
  fee: string;
  size: number;
}

export interface ZKProofInputs {
  // Bitcoin transaction data
  btcTxHash: string;
  merkleRoot: string;
  merkleProof: string[];
  proofIndex: number;
  blockHeight: number;
  
  // Transaction details
  inputAmount: string;
  outputAmount: string;
  fee: string;
  
  // Public inputs
  publicAmount: string;
  publicAddress: string;
  
  // Private inputs (witness)
  privateSecret: string;
  nonce: string;
}

export interface ZKProofResult {
  proof: {
    pi_a: [string, string, string];
    pi_b: [[string, string], [string, string], [string, string]];
    pi_c: [string, string, string];
  };
  publicSignals: string[];
  verificationKey: any;
}

export interface MerkleProof {
  root: string;
  path: string[];
  indices: number[];
  leaf: string;
}

