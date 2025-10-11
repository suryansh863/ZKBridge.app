"use client"

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface ZKProofData {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  circuitInputs: {
    btcTxHash: string;
    merkleRoot: string;
    merkleProof: string[];
    proofIndex: number;
    blockHeight: number;
    inputAmount: string;
    outputAmount: string;
    fee: string;
    publicAmount: string;
    publicAddress: string;
    privateSecret: string;
    nonce: string;
  };
  verificationKey: any;
}

export interface BitcoinTransactionProof {
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

export interface ZKProofOptions {
  secret?: string;
  publicAmount?: string;
  publicAddress?: string;
  bitcoinTx?: BitcoinTransactionProof;
}

export function useZKProof() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProof, setLastProof] = useState<ZKProofData | null>(null);

  /**
   * Generate ZK proof for Bitcoin transaction verification
   */
  const generateBitcoinTransactionProof = useCallback(async (
    bitcoinTx: BitcoinTransactionProof,
    publicAmount: string,
    publicAddress: string,
    privateSecret: string
  ): Promise<ZKProofData> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Generating Bitcoin transaction ZK proof', {
        txHash: bitcoinTx.txHash,
        publicAmount,
        publicAddress
      });

      // Call backend API to generate proof
      const response = await fetch('/api/zk/bitcoin-transaction-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bitcoinTx,
          publicAmount,
          publicAddress,
          privateSecret
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const proofData: ZKProofData = await response.json();
      setLastProof(proofData);

      logger.info('Bitcoin transaction ZK proof generated successfully', {
        txHash: bitcoinTx.txHash,
        publicSignals: proofData.publicSignals.length
      });

      return proofData;
    } catch (error) {
      logger.error('Failed to generate Bitcoin transaction ZK proof', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate ZK proof for Merkle tree verification
   */
  const generateMerkleProof = useCallback(async (
    merkleRoot: string,
    merkleProof: string[],
    proofIndex: number,
    leafHash: string
  ): Promise<ZKProofData> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Generating Merkle proof ZK proof', {
        merkleRoot,
        proofIndex,
        leafHash
      });

      const response = await fetch('/api/zk/merkle-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merkleRoot,
          merkleProof,
          proofIndex,
          leafHash
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const proofData: ZKProofData = await response.json();
      setLastProof(proofData);

      logger.info('Merkle proof ZK proof generated successfully', {
        merkleRoot,
        proofIndex,
        publicSignals: proofData.publicSignals.length
      });

      return proofData;
    } catch (error) {
      logger.error('Failed to generate Merkle proof ZK proof', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify ZK proof
   */
  const verifyProof = useCallback(async (
    proof: any,
    publicSignals: string[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Verifying ZK proof', {
        publicSignals: publicSignals.length
      });

      const response = await fetch('/api/zk/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof,
          publicSignals
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const isValid = result.isValid;

      logger.info('ZK proof verification completed', {
        isValid,
        publicSignals: publicSignals.length
      });

      return isValid;
    } catch (error) {
      logger.error('Failed to verify ZK proof', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate demo proof for visualization
   */
  const generateDemoProof = useCallback(async (
    secret: string,
    publicAmount: string = '0.001',
    publicAddress: string = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  ): Promise<ZKProofData> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Generating demo ZK proof', { secret, publicAmount, publicAddress });

      // Demo proof generation is not implemented - use real ZK proof generation instead
      throw new Error('Demo proof generation not implemented - use real ZK proof generation');
    } catch (error) {
      logger.error('Failed to generate demo ZK proof', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get circuit information
   */
  const getCircuitInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/zk/circuit-info');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logger.error('Failed to get circuit info', error);
      throw error;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear last proof
   */
  const clearLastProof = useCallback(() => {
    setLastProof(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    lastProof,
    
    // Functions
    generateBitcoinTransactionProof,
    generateMerkleProof,
    verifyProof,
    generateDemoProof,
    getCircuitInfo,
    clearError,
    clearLastProof,
  };
}

