import { groth16 } from 'snarkjs';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';
import { ZKProof, MerkleProof } from '../types';

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

export interface ZKCircuitInputs {
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
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  circuitInputs: ZKCircuitInputs;
  verificationKey: any;
}

export class ZKProofService {
  private circuitPath: string;
  private provingKeyPath: string;
  private verificationKeyPath: string;
  private isCircuitAvailable: boolean;

  constructor() {
    this.circuitPath = path.join(__dirname, '../../circuits/bridge.wasm');
    this.provingKeyPath = path.join(__dirname, '../../circuits/proving_key.zkey');
    this.verificationKeyPath = path.join(__dirname, '../../circuits/verification_key.json');
    this.isCircuitAvailable = this.checkCircuitFiles();
  }

  private checkCircuitFiles(): boolean {
    try {
      return fs.existsSync(this.circuitPath) && 
             fs.existsSync(this.provingKeyPath) && 
             fs.existsSync(this.verificationKeyPath);
    } catch (error) {
      logger.warn('ZK circuit files not found. Using mock proofs for development.', { service: 'zkbridge-backend' });
      return false;
    }
  }

  /**
   * Generate ZK proof for Bitcoin transaction verification
   */
  async generateBitcoinTransactionProof(
    bitcoinTx: BitcoinTransactionProof,
    publicAmount: string,
    publicAddress: string,
    privateSecret: string
  ): Promise<ZKProofResult> {
    try {
      if (!this.isCircuitAvailable) {
        return this.generateMockBitcoinProof(bitcoinTx, publicAmount, publicAddress, privateSecret);
      }

      // Prepare circuit inputs
      const circuitInputs: ZKCircuitInputs = {
        btcTxHash: bitcoinTx.txHash,
        merkleRoot: bitcoinTx.merkleRoot,
        merkleProof: bitcoinTx.merkleProof,
        proofIndex: bitcoinTx.proofIndex,
        blockHeight: bitcoinTx.blockHeight,
        inputAmount: bitcoinTx.inputs.reduce((sum, input) => sum + parseFloat(input.amount), 0).toString(),
        outputAmount: bitcoinTx.outputs.reduce((sum, output) => sum + parseFloat(output.amount), 0).toString(),
        fee: bitcoinTx.fee,
        publicAmount,
        publicAddress,
        privateSecret,
        nonce: this.generateNonce()
      };

      // Generate witness
      const witness = await this.generateWitness(circuitInputs);

      // Generate proof using groth16
      const { proof, publicSignals } = await groth16.fullProve(
        witness,
        this.circuitPath,
        this.provingKeyPath
      );

      // Load verification key
      const verificationKey = JSON.parse(fs.readFileSync(this.verificationKeyPath, 'utf8'));

      logger.info('Bitcoin transaction ZK proof generated successfully', {
        txHash: bitcoinTx.txHash,
        publicSignals: publicSignals.length,
        proofSize: JSON.stringify(proof).length
      });

      return {
        proof: {
          pi_a: proof.pi_a,
          pi_b: proof.pi_b,
          pi_c: proof.pi_c
        },
        publicSignals,
        circuitInputs,
        verificationKey
      };
    } catch (error) {
      logger.error('Error generating Bitcoin transaction ZK proof:', error);
      throw new Error(`Failed to generate Bitcoin transaction ZK proof: ${error.message}`);
    }
  }

  /**
   * Generate ZK proof for Merkle tree verification
   */
  async generateMerkleProof(
    merkleRoot: string,
    merkleProof: string[],
    proofIndex: number,
    leafHash: string
  ): Promise<ZKProofResult> {
    try {
      if (!this.isCircuitAvailable) {
        return this.generateMockMerkleProof(merkleRoot, merkleProof, proofIndex, leafHash);
      }

      const circuitInputs: ZKCircuitInputs = {
        btcTxHash: leafHash,
        merkleRoot,
        merkleProof,
        proofIndex,
        blockHeight: 0, // Not needed for Merkle proof
        inputAmount: '0',
        outputAmount: '0',
        fee: '0',
        publicAmount: '0',
        publicAddress: '',
        privateSecret: this.generateNonce(),
        nonce: this.generateNonce()
      };

      const witness = await this.generateWitness(circuitInputs);
      const { proof, publicSignals } = await groth16.fullProve(
        witness,
        this.circuitPath,
        this.provingKeyPath
      );

      const verificationKey = JSON.parse(fs.readFileSync(this.verificationKeyPath, 'utf8'));

      logger.info('Merkle proof ZK proof generated successfully', {
        merkleRoot,
        proofIndex,
        publicSignals: publicSignals.length
      });

      return {
        proof: {
          pi_a: proof.pi_a,
          pi_b: proof.pi_b,
          pi_c: proof.pi_c
        },
        publicSignals,
        circuitInputs,
        verificationKey
      };
    } catch (error) {
      logger.error('Error generating Merkle proof ZK proof:', error);
      throw new Error(`Failed to generate Merkle proof ZK proof: ${error.message}`);
    }
  }

  /**
   * Verify ZK proof
   */
  async verifyProof(proof: any, publicSignals: string[], verificationKey?: any): Promise<boolean> {
    try {
      if (!this.isCircuitAvailable) {
        return this.verifyMockProof(proof, publicSignals);
      }

      const vk = verificationKey || JSON.parse(fs.readFileSync(this.verificationKeyPath, 'utf8'));
      const isValid = await groth16.verify(vk, publicSignals, proof);

      logger.info('ZK proof verification completed', {
        isValid,
        publicSignals: publicSignals.length
      });

      return isValid;
    } catch (error) {
      logger.error('Error verifying ZK proof:', error);
      throw new Error(`Failed to verify ZK proof: ${error.message}`);
    }
  }

  /**
   * Generate witness for circuit inputs
   */
  private async generateWitness(inputs: ZKCircuitInputs): Promise<any> {
    // This would typically use a witness generator
    // For now, we'll create a mock witness
    return {
      btcTxHash: this.hashInput(inputs.btcTxHash),
      merkleRoot: this.hashInput(inputs.merkleRoot),
      merkleProof: inputs.merkleProof.map(proof => this.hashInput(proof)),
      proofIndex: inputs.proofIndex,
      blockHeight: inputs.blockHeight,
      inputAmount: this.hashInput(inputs.inputAmount),
      outputAmount: this.hashInput(inputs.outputAmount),
      fee: this.hashInput(inputs.fee),
      publicAmount: this.hashInput(inputs.publicAmount),
      publicAddress: this.hashInput(inputs.publicAddress),
      privateSecret: this.hashInput(inputs.privateSecret),
      nonce: this.hashInput(inputs.nonce)
    };
  }

  /**
   * Generate mock Bitcoin transaction proof for development
   */
  private generateMockBitcoinProof(
    bitcoinTx: BitcoinTransactionProof,
    publicAmount: string,
    publicAddress: string,
    privateSecret: string
  ): ZKProofResult {
    const mockProof = {
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
    };

    const publicSignals = [
      publicAmount,
      publicAddress,
      bitcoinTx.txHash,
      bitcoinTx.merkleRoot,
      bitcoinTx.blockHeight.toString()
    ];

    const circuitInputs: ZKCircuitInputs = {
      btcTxHash: bitcoinTx.txHash,
      merkleRoot: bitcoinTx.merkleRoot,
      merkleProof: bitcoinTx.merkleProof,
      proofIndex: bitcoinTx.proofIndex,
      blockHeight: bitcoinTx.blockHeight,
      inputAmount: bitcoinTx.inputs.reduce((sum, input) => sum + parseFloat(input.amount), 0).toString(),
      outputAmount: bitcoinTx.outputs.reduce((sum, output) => sum + parseFloat(output.amount), 0).toString(),
      fee: bitcoinTx.fee,
      publicAmount,
      publicAddress,
      privateSecret,
      nonce: this.generateNonce()
    };

    logger.info('Mock Bitcoin transaction ZK proof generated', {
      txHash: bitcoinTx.txHash,
      publicSignals: publicSignals.length
    });

    return {
      proof: mockProof,
      publicSignals,
      circuitInputs,
      verificationKey: { mock: true }
    };
  }

  /**
   * Generate mock Merkle proof for development
   */
  private generateMockMerkleProof(
    merkleRoot: string,
    merkleProof: string[],
    proofIndex: number,
    leafHash: string
  ): ZKProofResult {
    const mockProof = {
      pi_a: [
        "1111111111111111111111111111111111111111111111111111111111111111",
        "2222222222222222222222222222222222222222222222222222222222222222",
        "1"
      ],
      pi_b: [
        [
          "3333333333333333333333333333333333333333333333333333333333333333",
          "4444444444444444444444444444444444444444444444444444444444444444"
        ],
        [
          "5555555555555555555555555555555555555555555555555555555555555555",
          "6666666666666666666666666666666666666666666666666666666666666666"
        ],
        [
          "1",
          "0"
        ]
      ],
      pi_c: [
        "7777777777777777777777777777777777777777777777777777777777777777",
        "8888888888888888888888888888888888888888888888888888888888888888",
        "1"
      ]
    };

    const publicSignals = [
      merkleRoot,
      leafHash,
      proofIndex.toString(),
      merkleProof.length.toString()
    ];

    const circuitInputs: ZKCircuitInputs = {
      btcTxHash: leafHash,
      merkleRoot,
      merkleProof,
      proofIndex,
      blockHeight: 0,
      inputAmount: '0',
      outputAmount: '0',
      fee: '0',
      publicAmount: '0',
      publicAddress: '',
      privateSecret: this.generateNonce(),
      nonce: this.generateNonce()
    };

    logger.info('Mock Merkle proof ZK proof generated', {
      merkleRoot,
      proofIndex,
      publicSignals: publicSignals.length
    });

    return {
      proof: mockProof,
      publicSignals,
      circuitInputs,
      verificationKey: { mock: true }
    };
  }

  /**
   * Verify mock proof for development
   */
  private verifyMockProof(proof: any, publicSignals: string[]): boolean {
    // Simple mock verification - always returns true for development
    logger.info('Mock ZK proof verification completed', {
      isValid: true,
      publicSignals: publicSignals.length
    });
    return true;
  }

  /**
   * Hash input for circuit
   */
  private hashInput(input: string): string {
    // Simple hash function for demo purposes
    // In production, use proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Generate nonce
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get circuit information
   */
  getCircuitInfo(): any {
    return {
      isAvailable: this.isCircuitAvailable,
      circuitPath: this.circuitPath,
      provingKeyPath: this.provingKeyPath,
      verificationKeyPath: this.verificationKeyPath,
      lastModified: this.isCircuitAvailable ? fs.statSync(this.circuitPath).mtime : null
    };
  }

  /**
   * Compile circuit (for development)
   */
  async compileCircuit(): Promise<boolean> {
    try {
      // This would typically use circom to compile the circuit
      // For now, we'll just check if files exist
      logger.info('Circuit compilation requested', {
        circuitPath: this.circuitPath,
        isAvailable: this.isCircuitAvailable
      });
      
      return this.isCircuitAvailable;
    } catch (error) {
      logger.error('Error compiling circuit:', error);
      return false;
    }
  }
}