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

      // Create mock Bitcoin transaction data
      const mockBitcoinTx: BitcoinTransactionProof = {
        txHash: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16',
        merkleRoot: 'ef1d870d24c85b89d5adcc212a6f10d837b9e2d9',
        merkleProof: [
          'a1b2c3d4e5f6789012345678901234567890abcdef',
          'fedcba0987654321098765432109876543210fedcba'
        ],
        proofIndex: 0,
        blockHeight: 123456,
        blockHash: '0000000000000000000000000000000000000000000000000000000000000000',
        inputs: [
          {
            address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: '0.001',
            txHash: 'prev_tx_hash',
            outputIndex: 0
          }
        ],
        outputs: [
          {
            address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: '0.001'
          }
        ],
        fee: '0.00001',
        size: 250
      };

      const proofData: ZKProofData = {
        proof: {
          pi_a: [
            "1234567890123456789012345678901234567890123456789012345678901234",
            "2345678901234567890123456789012345678901234567890123456789012345",
            "1"
          ],
          pi_b: [
            [
              "3456789012345678901234567890123456789012345678901234567890123456",
              "4567890123456789012345678901234567890123456789012345678901234567"
            ],
            [
              "5678901234567890123456789012345678901234567890123456789012345678",
              "6789012345678901234567890123456789012345678901234567890123456789"
            ],
            [
              "1",
              "0"
            ]
          ],
          pi_c: [
            "7890123456789012345678901234567890123456789012345678901234567890",
            "8901234567890123456789012345678901234567890123456789012345678901",
            "1"
          ]
        },
        publicSignals: [
          publicAmount,
          publicAddress,
          mockBitcoinTx.txHash,
          mockBitcoinTx.merkleRoot,
          mockBitcoinTx.blockHeight.toString()
        ],
        circuitInputs: {
          btcTxHash: mockBitcoinTx.txHash,
          merkleRoot: mockBitcoinTx.merkleRoot,
          merkleProof: mockBitcoinTx.merkleProof,
          proofIndex: mockBitcoinTx.proofIndex,
          blockHeight: mockBitcoinTx.blockHeight,
          inputAmount: mockBitcoinTx.inputs.reduce((sum, input) => sum + parseFloat(input.amount), 0).toString(),
          outputAmount: mockBitcoinTx.outputs.reduce((sum, output) => sum + parseFloat(output.amount), 0).toString(),
          fee: mockBitcoinTx.fee,
          publicAmount,
          publicAddress,
          privateSecret: secret,
          nonce: Math.random().toString(36).substring(2, 15)
        },
        verificationKey: { mock: true }
      };

      setLastProof(proofData);

      logger.info('Demo ZK proof generated successfully', {
        secret,
        publicAmount,
        publicAddress,
        publicSignals: proofData.publicSignals.length
      });

      return proofData;
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

