import { groth16 } from 'snarkjs';
import * as fs from 'fs';
import * as path from 'path';
import { ZKProofInputs, ZKProofResult } from './types';

export class ZKProofGenerator {
  private wasmPath: string;
  private zkeyPath: string;
  private vkeyPath: string;

  constructor() {
    this.wasmPath = path.join(__dirname, '../circuits/bridge.wasm');
    this.zkeyPath = path.join(__dirname, '../circuits/bridge_0001.zkey');
    this.vkeyPath = path.join(__dirname, '../circuits/verification_key.json');
  }

  async generateProof(inputs: ZKProofInputs): Promise<ZKProofResult> {
    try {
      // Check if files exist
      if (!fs.existsSync(this.wasmPath) || !fs.existsSync(this.zkeyPath)) {
        throw new Error('Circuit files not found. Please run circuit compilation first.');
      }

      // Prepare inputs for the circuit
      const circuitInputs = {
        // Bitcoin transaction data
        btcTxHash: this.hashToField(inputs.btcTxHash),
        merkleRoot: this.hashToField(inputs.merkleRoot),
        merkleProof: inputs.merkleProof.map(hash => this.hashToField(hash)),
        proofIndex: inputs.proofIndex,
        blockHeight: inputs.blockHeight,
        
        // Transaction details
        inputAmount: this.amountToField(inputs.inputAmount),
        outputAmount: this.amountToField(inputs.outputAmount),
        fee: this.amountToField(inputs.fee),
        
        // Public inputs
        publicAmount: this.amountToField(inputs.publicAmount),
        publicAddress: this.hashToField(inputs.publicAddress),
        
        // Private inputs (witness)
        privateSecret: this.hashToField(inputs.privateSecret),
        nonce: this.hashToField(inputs.nonce)
      };

      // Generate proof
      const { proof, publicSignals } = await groth16.fullProve(
        circuitInputs,
        this.wasmPath,
        this.zkeyPath
      );

      // Load verification key
      const verificationKey = JSON.parse(fs.readFileSync(this.vkeyPath, 'utf8'));

      return {
        proof,
        publicSignals,
        verificationKey
      };
    } catch (error) {
      throw new Error(`Proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyProof(proof: any, publicSignals: string[], verificationKey: any): Promise<boolean> {
    try {
      return await groth16.verify(verificationKey, publicSignals, proof);
    } catch (error) {
      throw new Error(`Proof verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private hashToField(hash: string): string {
    // Convert hash string to field element
    // This is a simplified conversion - in production, use proper field arithmetic
    const hashNum = BigInt('0x' + hash.replace('0x', ''));
    return hashNum.toString();
  }

  private amountToField(amount: string): string {
    // Convert amount (in satoshis) to field element
    return BigInt(amount).toString();
  }
}

