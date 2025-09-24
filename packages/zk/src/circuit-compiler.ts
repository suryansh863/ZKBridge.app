import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class CircuitCompiler {
  private circuitsDir: string;

  constructor() {
    this.circuitsDir = path.join(__dirname, '../circuits');
  }

  async compileCircuit(circuitName: string = 'bridge'): Promise<void> {
    try {
      const circuitPath = path.join(this.circuitsDir, `${circuitName}.circom`);
      
      if (!fs.existsSync(circuitPath)) {
        throw new Error(`Circuit file not found: ${circuitPath}`);
      }

      console.log(`Compiling circuit: ${circuitName}`);
      
      // Compile the circuit
      await execAsync(`circom ${circuitPath} --r1cs --wasm --sym --c --output ${this.circuitsDir}`);
      
      console.log(`Circuit ${circuitName} compiled successfully`);
    } catch (error) {
      throw new Error(`Circuit compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setupTrustedSetup(): Promise<void> {
    try {
      console.log('Setting up trusted setup...');
      
      // Phase 1: Powers of Tau
      await execAsync('snarkjs powersoftau new bn128 12 pot12_0000.ptau -v');
      await execAsync('snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v');
      await execAsync('snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v');
      
      // Phase 2: Circuit-specific setup
      const r1csPath = path.join(this.circuitsDir, 'bridge.r1cs');
      if (!fs.existsSync(r1csPath)) {
        throw new Error('R1CS file not found. Please compile the circuit first.');
      }
      
      await execAsync(`snarkjs groth16 setup ${r1csPath} pot12_final.ptau bridge_0000.zkey`);
      await execAsync('snarkjs zkey contribute bridge_0000.zkey bridge_0001.zkey --name="1st Contributor Name" -v');
      await execAsync('snarkjs zkey export verificationkey bridge_0001.zkey verification_key.json');
      
      console.log('Trusted setup completed successfully');
    } catch (error) {
      throw new Error(`Trusted setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateProof(inputs: any): Promise<any> {
    try {
      const wasmPath = path.join(this.circuitsDir, 'bridge.wasm');
      const zkeyPath = path.join(this.circuitsDir, 'bridge_0001.zkey');
      
      if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
        throw new Error('Circuit files not found. Please run compilation and setup first.');
      }

      // Generate proof using snarkjs CLI
      const inputFile = path.join(this.circuitsDir, 'input.json');
      fs.writeFileSync(inputFile, JSON.stringify(inputs, null, 2));
      
      await execAsync(`snarkjs groth16 prove ${zkeyPath} ${wasmPath} ${inputFile} proof.json public.json`);
      
      // Read generated proof and public signals
      const proof = JSON.parse(fs.readFileSync('proof.json', 'utf8'));
      const publicSignals = JSON.parse(fs.readFileSync('public.json', 'utf8'));
      
      // Clean up temporary files
      fs.unlinkSync(inputFile);
      fs.unlinkSync('proof.json');
      fs.unlinkSync('public.json');
      
      return { proof, publicSignals };
    } catch (error) {
      throw new Error(`Proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyProof(proof: any, publicSignals: any): Promise<boolean> {
    try {
      const vkeyPath = path.join(this.circuitsDir, 'verification_key.json');
      
      if (!fs.existsSync(vkeyPath)) {
        throw new Error('Verification key not found. Please run setup first.');
      }

      // Write proof and public signals to temporary files
      fs.writeFileSync('proof.json', JSON.stringify(proof, null, 2));
      fs.writeFileSync('public.json', JSON.stringify(publicSignals, null, 2));
      
      // Verify proof using snarkjs CLI
      const { stdout } = await execAsync(`snarkjs groth16 verify ${vkeyPath} public.json proof.json`);
      
      // Clean up temporary files
      fs.unlinkSync('proof.json');
      fs.unlinkSync('public.json');
      
      return stdout.trim() === 'OK';
    } catch (error) {
      throw new Error(`Proof verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

