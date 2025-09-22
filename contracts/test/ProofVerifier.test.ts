import { expect } from "chai";
import { ethers } from "hardhat";
import { ProofVerifier } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ProofVerifier", function () {
  let proofVerifier: ProofVerifier;
  let admin: SignerWithAddress;
  let verifier: SignerWithAddress;
  let operator: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [admin, verifier, operator, user] = await ethers.getSigners();

    const ProofVerifierFactory = await ethers.getContractFactory("ProofVerifier");
    proofVerifier = await ProofVerifierFactory.deploy();
    await proofVerifier.waitForDeployment();

    // Grant roles
    await proofVerifier.grantRole(await proofVerifier.VERIFIER_ROLE(), verifier.address);
    await proofVerifier.grantRole(await proofVerifier.OPERATOR_ROLE(), operator.address);
  });

  describe("Deployment", function () {
    it("Should grant admin role to deployer", async function () {
      expect(await proofVerifier.hasRole(await proofVerifier.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await proofVerifier.hasRole(await proofVerifier.ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await proofVerifier.hasRole(await proofVerifier.VERIFIER_ROLE(), admin.address)).to.be.true;
      expect(await proofVerifier.hasRole(await proofVerifier.OPERATOR_ROLE(), admin.address)).to.be.true;
    });

    it("Should initialize default circuits", async function () {
      const bitcoinTxCircuit = await proofVerifier.circuits(ethers.keccak256(ethers.toUtf8Bytes("bitcoin_tx_verify")));
      expect(bitcoinTxCircuit.active).to.be.true;
      expect(bitcoinTxCircuit.maxPublicInputs).to.equal(16);
      expect(bitcoinTxCircuit.proofSize).to.equal(256);

      const merkleProofCircuit = await proofVerifier.circuits(ethers.keccak256(ethers.toUtf8Bytes("merkle_proof_verify")));
      expect(merkleProofCircuit.active).to.be.true;
      expect(merkleProofCircuit.maxPublicInputs).to.equal(8);
      expect(merkleProofCircuit.proofSize).to.equal(128);

      const bridgeTxCircuit = await proofVerifier.circuits(ethers.keccak256(ethers.toUtf8Bytes("bridge_tx_verify")));
      expect(bridgeTxCircuit.active).to.be.true;
      expect(bridgeTxCircuit.maxPublicInputs).to.equal(24);
      expect(bridgeTxCircuit.proofSize).to.equal(384);
    });
  });

  describe("Proof Submission", function () {
    const CIRCUIT_ID = ethers.keccak256(ethers.toUtf8Bytes("bitcoin_tx_verify"));
    const PROOF = "0x" + "a".repeat(512); // 256 bytes
    const PUBLIC_INPUTS = [1, 2, 3, 4, 5];
    const TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    it("Should allow operator to submit proof", async function () {
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH)
      )
        .to.emit(proofVerifier, "ProofSubmitted");

      const stats = await proofVerifier.getStatistics();
      expect(stats.submitted).to.equal(1);
    });

    it("Should reject empty proof", async function () {
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, "0x", PUBLIC_INPUTS, TX_HASH)
      ).to.be.revertedWith("ProofVerifier: empty proof");
    });

    it("Should reject proof size exceeding maximum", async function () {
      const largeProof = "0x" + "a".repeat(2048); // 1024 bytes, exceeds MAX_PROOF_SIZE
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, largeProof, PUBLIC_INPUTS, TX_HASH)
      ).to.be.revertedWith("ProofVerifier: proof size exceeds maximum");
    });

    it("Should reject too many public inputs", async function () {
      const manyInputs = Array(33).fill(1); // Exceeds MAX_PUBLIC_INPUTS
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, manyInputs, TX_HASH)
      ).to.be.revertedWith("ProofVerifier: too many public inputs");
    });

    it("Should reject empty public inputs", async function () {
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, [], TX_HASH)
      ).to.be.revertedWith("ProofVerifier: no public inputs");
    });

    it("Should reject invalid circuit ID", async function () {
      const invalidCircuitId = ethers.keccak256(ethers.toUtf8Bytes("invalid_circuit"));
      await expect(
        proofVerifier.connect(operator).submitProof(invalidCircuitId, PROOF, PUBLIC_INPUTS, TX_HASH)
      ).to.be.revertedWith("ProofVerifier: circuit not active");
    });

    it("Should reject invalid transaction hash", async function () {
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, ethers.ZeroHash)
      ).to.be.revertedWith("ProofVerifier: invalid transaction hash");
    });

    it("Should reject non-operator from submitting proof", async function () {
      await expect(
        proofVerifier.connect(user).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH)
      ).to.be.revertedWith("ProofVerifier: caller is not an operator");
    });

    it("Should reject duplicate proof", async function () {
      await proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH);
      
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH)
      ).to.be.revertedWith("ProofVerifier: duplicate proof");
    });

    it("Should enforce proof cooldown", async function () {
      const TX_HASH_2 = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      
      await proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH);
      
      // Try to submit another proof for same transaction too soon
      await expect(
        proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH)
      ).to.be.revertedWith("ProofVerifier: proof cooldown not met");
    });
  });

  describe("Proof Verification", function () {
    const CIRCUIT_ID = ethers.keccak256(ethers.toUtf8Bytes("bitcoin_tx_verify"));
    const PROOF = "0x" + "a".repeat(512); // 256 bytes
    const PUBLIC_INPUTS = [1, 2, 3, 4, 5];
    const TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    let proofHash: string;

    beforeEach(async function () {
      await proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH);
      // Get the proof hash (this would be returned by submitProof in a real implementation)
      proofHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes", "uint256[]", "bytes32", "uint256"],
        [CIRCUIT_ID, PROOF, PUBLIC_INPUTS, TX_HASH, await ethers.provider.getBlockNumber()]
      ));
    });

    it("Should allow verifier to verify proof", async function () {
      await expect(
        proofVerifier.connect(verifier).verifyProof(proofHash)
      )
        .to.emit(proofVerifier, "ProofVerified");

      const [isVerified, isValid] = await proofVerifier.isProofValid(proofHash);
      expect(isVerified).to.be.true;
      expect(isValid).to.be.true; // Our mock returns true for valid proofs
    });

    it("Should reject verification of non-existent proof", async function () {
      const nonExistentProofHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      
      await expect(
        proofVerifier.connect(verifier).verifyProof(nonExistentProofHash)
      ).to.be.revertedWith("ProofVerifier: proof does not exist");
    });

    it("Should reject verification of already verified proof", async function () {
      await proofVerifier.connect(verifier).verifyProof(proofHash);
      
      await expect(
        proofVerifier.connect(verifier).verifyProof(proofHash)
      ).to.be.revertedWith("ProofVerifier: proof already verified");
    });

    it("Should reject non-verifier from verifying proof", async function () {
      await expect(
        proofVerifier.connect(user).verifyProof(proofHash)
      ).to.be.revertedWith("ProofVerifier: caller is not a verifier");
    });

    it("Should handle verification timeout", async function () {
      // Fast forward time past verification timeout
      await ethers.provider.send("evm_increaseTime", [301]); // 5 minutes + 1 second
      await ethers.provider.send("evm_mine", []);

      await expect(
        proofVerifier.connect(verifier).verifyProof(proofHash)
      ).to.be.revertedWith("ProofVerifier: verification timeout");
    });
  });

  describe("Batch Verification", function () {
    const CIRCUIT_ID = ethers.keccak256(ethers.toUtf8Bytes("bitcoin_tx_verify"));
    const PROOF = "0x" + "a".repeat(512);
    const PUBLIC_INPUTS = [1, 2, 3, 4, 5];

    it("Should allow batch verification", async function () {
      const proofHashes = [];
      
      // Submit multiple proofs
      for (let i = 0; i < 3; i++) {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes(`tx_${i}`));
        await proofVerifier.connect(operator).submitProof(CIRCUIT_ID, PROOF, PUBLIC_INPUTS, txHash);
        
        const proofHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes", "uint256[]", "bytes32", "uint256"],
          [CIRCUIT_ID, PROOF, PUBLIC_INPUTS, txHash, await ethers.provider.getBlockNumber()]
        ));
        proofHashes.push(proofHash);
      }

      const results = await proofVerifier.connect(verifier).batchVerifyProofs(proofHashes);
      expect(results.length).to.equal(3);
      expect(results.every(r => r === true)).to.be.true;
    });

    it("Should reject empty batch", async function () {
      await expect(
        proofVerifier.connect(verifier).batchVerifyProofs([])
      ).to.be.revertedWith("ProofVerifier: empty proof array");
    });

    it("Should reject batch with too many proofs", async function () {
      const proofHashes = Array(11).fill(ethers.keccak256(ethers.toUtf8Bytes("dummy")));
      
      await expect(
        proofVerifier.connect(verifier).batchVerifyProofs(proofHashes)
      ).to.be.revertedWith("ProofVerifier: too many proofs in batch");
    });
  });

  describe("Circuit Management", function () {
    const NEW_CIRCUIT_ID = ethers.keccak256(ethers.toUtf8Bytes("new_circuit"));
    const VERIFICATION_KEY = ethers.keccak256(ethers.toUtf8Bytes("verification_key"));
    const MAX_PUBLIC_INPUTS = 12;
    const PROOF_SIZE = 192;

    it("Should allow admin to update circuit", async function () {
      await expect(
        proofVerifier.connect(admin).updateCircuit(
          NEW_CIRCUIT_ID,
          VERIFICATION_KEY,
          MAX_PUBLIC_INPUTS,
          PROOF_SIZE,
          true
        )
      )
        .to.emit(proofVerifier, "VerificationKeyUpdated")
        .withArgs(NEW_CIRCUIT_ID, admin.address, await ethers.provider.getBlockNumber());

      const circuit = await proofVerifier.circuits(NEW_CIRCUIT_ID);
      expect(circuit.verificationKey).to.equal(VERIFICATION_KEY);
      expect(circuit.maxPublicInputs).to.equal(MAX_PUBLIC_INPUTS);
      expect(circuit.proofSize).to.equal(PROOF_SIZE);
      expect(circuit.active).to.be.true;
    });

    it("Should reject invalid verification key", async function () {
      await expect(
        proofVerifier.connect(admin).updateCircuit(
          NEW_CIRCUIT_ID,
          ethers.ZeroHash,
          MAX_PUBLIC_INPUTS,
          PROOF_SIZE,
          true
        )
      ).to.be.revertedWith("ProofVerifier: invalid verification key");
    });

    it("Should reject invalid max public inputs", async function () {
      await expect(
        proofVerifier.connect(admin).updateCircuit(
          NEW_CIRCUIT_ID,
          VERIFICATION_KEY,
          0,
          PROOF_SIZE,
          true
        )
      ).to.be.revertedWith("ProofVerifier: invalid max public inputs");
    });

    it("Should reject invalid proof size", async function () {
      await expect(
        proofVerifier.connect(admin).updateCircuit(
          NEW_CIRCUIT_ID,
          VERIFICATION_KEY,
          MAX_PUBLIC_INPUTS,
          0,
          true
        )
      ).to.be.revertedWith("ProofVerifier: invalid proof size");
    });

    it("Should reject non-admin from updating circuits", async function () {
      await expect(
        proofVerifier.connect(user).updateCircuit(
          NEW_CIRCUIT_ID,
          VERIFICATION_KEY,
          MAX_PUBLIC_INPUTS,
          PROOF_SIZE,
          true
        )
      ).to.be.revertedWith("AccessControl: account " + user.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to pause in emergency", async function () {
      await proofVerifier.connect(admin).emergencyPause();
      expect(await proofVerifier.emergencyMode()).to.be.true;
      expect(await proofVerifier.paused()).to.be.true;
    });

    it("Should allow admin to resume after emergency", async function () {
      await proofVerifier.connect(admin).emergencyPause();
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      await proofVerifier.connect(admin).resume();
      expect(await proofVerifier.emergencyMode()).to.be.false;
      expect(await proofVerifier.paused()).to.be.false;
    });

    it("Should reject resume before emergency check interval", async function () {
      await proofVerifier.connect(admin).emergencyPause();
      
      await expect(
        proofVerifier.connect(admin).resume()
      ).to.be.revertedWith("ProofVerifier: emergency check interval not met");
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add verifier", async function () {
      await proofVerifier.connect(admin).addVerifier(user.address);
      expect(await proofVerifier.hasRole(await proofVerifier.VERIFIER_ROLE(), user.address)).to.be.true;
    });

    it("Should allow admin to remove verifier", async function () {
      await proofVerifier.connect(admin).removeVerifier(verifier.address);
      expect(await proofVerifier.hasRole(await proofVerifier.VERIFIER_ROLE(), verifier.address)).to.be.false;
    });

    it("Should reject non-admin from managing verifiers", async function () {
      await expect(
        proofVerifier.connect(user).addVerifier(user.address)
      ).to.be.revertedWith("AccessControl: account " + user.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });
});
