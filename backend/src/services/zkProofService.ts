import { groth16 } from 'snarkjs';
import { ZKProof } from '../types';
import { logger } from '../utils/logger';
import { generateNonce, sha256 } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ZKProofService {
  private circuitPath: string;
  private provingKeyPath: string;
  private verificationKeyPath: string;
  private isCircuitAvailable: boolean;

  constructor() {
    // Circuit file paths
    this.circuitPath = path.join(process.cwd(), 'circuits', 'bridge.wasm');
    this.provingKeyPath = path.join(process.cwd(), 'circuits', 'bridge_0001.zkey');
    this.verificationKeyPath = path.join(process.cwd(), 'circuits', 'verification_key.json');
    
    // Check if circuit files are available
    this.isCircuitAvailable = this.checkCircuitFiles();
    
    if (!this.isCircuitAvailable) {
      logger.warn('ZK circuit files not found. Using mock proofs for development.');
    }
  }

  private checkCircuitFiles(): boolean {
    try {
      return fs.existsSync(this.circuitPath) && 
             fs.existsSync(this.provingKeyPath) && 
             fs.existsSync(this.verificationKeyPath);
    } catch (error) {
      return false;
    }
  }

  async generateProof(secret: string, publicInput: string, additionalData?: any): Promise<ZKProof> {
    try {
      if (!this.isCircuitAvailable) {
        return this.generateMockProof(secret, publicInput, additionalData);
      }

      // Prepare circuit inputs
      const inputs = {
        secret: this.hashInput(secret),
        publicInput: this.hashInput(publicInput),
        nonce: this.generateNonce(),
        timestamp: Math.floor(Date.now() / 1000),
        ...additionalData
      };

      // Generate witness
      const witness = await this.generateWitness(inputs);

      // Generate proof using groth16
      const { proof, publicSignals } = await groth16.fullProve(
        witness,
        this.circuitPath,
        this.provingKeyPath
      );

      logger.info('ZK proof generated successfully', {
        publicSignals: publicSignals.length,
        proofSize: JSON.stringify(proof).length
      });

      return {
        proof: {
          pi_a: proof.pi_a,
          pi_b: proof.pi_b,
          pi_c: proof.pi_c
        },
        publicSignals
      };
    } catch (error) {
      logger.error('Error generating ZK proof:', error);
      throw new Error(`Failed to generate ZK proof: ${error.message}`);
    }
  }

  async verifyProof(proof: any, publicSignals: string[]): Promise<boolean> {
    try {
      if (!this.isCircuitAvailable) {
        return this.verifyMockProof(proof, publicSignals);
      }

      // Load verification key
      const verificationKey = JSON.parse(fs.readFileSync(this.verificationKeyPath, 'utf8'));

      // Verify proof using groth16
      const isValid = await groth16.verify(verificationKey, publicSignals, proof);

      logger.info('ZK proof verification result:', { isValid });
      return isValid;
    } catch (error) {
      logger.error('Error verifying ZK proof:', error);
      return false;
    }
  }

  async generateWitness(inputs: any): Promise<any> {
    try {
      if (!this.isCircuitAvailable) {
        return this.generateMockWitness(inputs);
      }

      // In a real implementation, this would use the circuit to generate witness
      // For now, we'll return a mock witness
      return {
        inputs,
        outputs: {
          publicSignal: this.hashInput(inputs.publicInput),
          nonce: inputs.nonce,
          timestamp: inputs.timestamp
        },
        intermediate: {
          hash: this.hashInput(JSON.stringify(inputs))
        }
      };
    } catch (error) {
      logger.error('Error generating witness:', error);
      throw new Error(`Failed to generate witness: ${error.message}`);
    }
  }

  async demoProofOfKnowledge(secret: string): Promise<{
    proof: ZKProof;
    isValid: boolean;
    message: string;
  }> {
    try {
      const publicInput = this.hashInput(secret);
      const proof = await this.generateProof(secret, publicInput);
      const isValid = await this.verifyProof(proof.proof, proof.publicSignals);

      return {
        proof,
        isValid,
        message: isValid 
          ? 'Successfully proved knowledge of secret without revealing it'
          : 'Proof verification failed'
      };
    } catch (error) {
      logger.error('Error in demo proof of knowledge:', error);
      throw new Error(`Failed to demonstrate proof of knowledge: ${error.message}`);
    }
  }

  async generateBridgeProof(bitcoinTxData: any, ethereumData: any): Promise<ZKProof> {
    try {
      // Prepare inputs for bridge proof
      const inputs = {
        // Bitcoin transaction data
        bitcoinTxHash: bitcoinTxData.txid,
        bitcoinAmount: bitcoinTxData.amount,
        bitcoinAddress: bitcoinTxData.fromAddress,
        bitcoinConfirmations: bitcoinTxData.confirmations,
        
        // Ethereum data
        ethereumAddress: ethereumData.address,
        ethereumAmount: ethereumData.amount,
        
        // Proof metadata
        nonce: generateNonce(),
        timestamp: Math.floor(Date.now() / 1000),
        bridgeId: this.generateBridgeId()
      };

      const publicInput = this.hashInput(JSON.stringify({
        bitcoinTxHash: inputs.bitcoinTxHash,
        bitcoinAmount: inputs.bitcoinAmount,
        ethereumAddress: inputs.ethereumAddress,
        ethereumAmount: inputs.ethereumAmount
      }));

      return await this.generateProof(JSON.stringify(inputs), publicInput, {
        bridgeType: 'bitcoin_to_ethereum',
        network: 'testnet'
      });
    } catch (error) {
      logger.error('Error generating bridge proof:', error);
      throw new Error(`Failed to generate bridge proof: ${error.message}`);
    }
  }

  async verifyBridgeProof(proof: ZKProof, expectedData: any): Promise<boolean> {
    try {
      // First verify the proof structure
      const proofValid = await this.verifyProof(proof.proof, proof.publicSignals);
      
      if (!proofValid) {
        return false;
      }

      // Verify that public signals match expected data
      const expectedHash = this.hashInput(JSON.stringify({
        bitcoinTxHash: expectedData.bitcoinTxHash,
        bitcoinAmount: expectedData.bitcoinAmount,
        ethereumAddress: expectedData.ethereumAddress,
        ethereumAmount: expectedData.ethereumAmount
      }));

      return proof.publicSignals.includes(expectedHash);
    } catch (error) {
      logger.error('Error verifying bridge proof:', error);
      return false;
    }
  }

  private hashInput(input: string): string {
    return sha256(input);
  }

  private generateNonce(): string {
    return generateNonce();
  }

  private generateBridgeId(): string {
    return `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mock implementations for development
  private generateMockProof(secret: string, publicInput: string, additionalData?: any): ZKProof {
    const nonce = this.generateNonce();
    const timestamp = Math.floor(Date.now() / 1000);
    
    return {
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
        publicInput,
        nonce,
        timestamp.toString()
      ]
    };
  }

  private verifyMockProof(proof: any, publicSignals: string[]): boolean {
    // Mock verification - check if proof has correct structure
    return !!(
      proof.pi_a && Array.isArray(proof.pi_a) && proof.pi_a.length === 3 &&
      proof.pi_b && Array.isArray(proof.pi_b) && proof.pi_b.length === 3 &&
      proof.pi_c && Array.isArray(proof.pi_c) && proof.pi_c.length === 3 &&
      publicSignals && Array.isArray(publicSignals) && publicSignals.length > 0
    );
  }

  private generateMockWitness(inputs: any): any {
    return {
      inputs,
      outputs: {
        publicSignal: this.hashInput(inputs.publicInput),
        nonce: inputs.nonce || this.generateNonce(),
        timestamp: inputs.timestamp || Math.floor(Date.now() / 1000)
      },
      intermediate: {
        hash: this.hashInput(JSON.stringify(inputs))
      }
    };
  }

  async getCircuitInfo(): Promise<any> {
    return {
      name: 'Bridge Circuit',
      version: '1.0.0',
      description: 'ZK circuit for Bitcoin-Ethereum bridge verification',
      inputs: {
        secret: 'string',
        publicInput: 'string',
        nonce: 'string',
        timestamp: 'number'
      },
      outputs: {
        publicSignal: 'string',
        nonce: 'string',
        timestamp: 'string'
      },
      constraints: 42, // Mock constraint count
      wires: 128, // Mock wire count
      isAvailable: this.isCircuitAvailable,
      circuitPath: this.circuitPath,
      provingKeyPath: this.provingKeyPath,
      verificationKeyPath: this.verificationKeyPath
    };
  }
}

