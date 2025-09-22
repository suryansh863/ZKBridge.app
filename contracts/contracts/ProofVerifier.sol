// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title ProofVerifier
 * @dev Zero-Knowledge proof verification for Bitcoin bridge transactions
 * @notice This contract verifies ZK proofs for Bitcoin transaction validity
 */
contract ProofVerifier is AccessControl, Pausable, ReentrancyGuard {
    using ECDSA for bytes32;
    using Math for uint256;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Constants
    uint256 public constant MAX_PROOF_SIZE = 1024; // Maximum proof size in bytes
    uint256 public constant MAX_PUBLIC_INPUTS = 32; // Maximum number of public inputs
    uint256 public constant VERIFICATION_TIMEOUT = 300; // 5 minutes timeout for verification
    uint256 public constant PROOF_COOLDOWN = 60; // 1 minute cooldown between proofs for same transaction

    // Events
    event ProofVerified(
        bytes32 indexed proofHash,
        bytes32 indexed txHash,
        address indexed verifier,
        uint256 timestamp,
        bool isValid
    );

    event ProofSubmitted(
        bytes32 indexed proofHash,
        bytes32 indexed txHash,
        address indexed submitter,
        uint256 timestamp
    );

    event VerificationKeyUpdated(
        bytes32 indexed circuitId,
        address indexed updater,
        uint256 timestamp
    );

    event ProofRejected(
        bytes32 indexed proofHash,
        bytes32 indexed txHash,
        string reason,
        uint256 timestamp
    );

    // Structs
    struct ZKProof {
        bytes32 circuitId; // Circuit identifier (e.g., keccak256("bitcoin_tx_verify"))
        bytes proof; // The actual ZK proof
        uint256[] publicInputs; // Public inputs to the circuit
        bytes32 txHash; // Bitcoin transaction hash
        uint256 timestamp; // Proof submission timestamp
        bool verified; // Whether the proof has been verified
        bool valid; // Whether the proof is valid
        address verifier; // Address that verified the proof
    }

    struct CircuitConfig {
        bytes32 verificationKey; // Circuit verification key
        uint256 maxPublicInputs; // Maximum number of public inputs
        uint256 proofSize; // Expected proof size
        bool active; // Whether the circuit is active
        uint256 lastUpdated; // Last update timestamp
    }

    // State variables
    mapping(bytes32 => ZKProof) public proofs; // proofHash => ZKProof
    mapping(bytes32 => CircuitConfig) public circuits; // circuitId => CircuitConfig
    mapping(bytes32 => uint256) public lastProofTime; // txHash => last proof submission time
    
    uint256 public totalProofsSubmitted;
    uint256 public totalProofsVerified;
    uint256 public totalProofsRejected;

    // Circuit breaker
    bool public emergencyMode = false;
    uint256 public lastEmergencyCheck;
    uint256 public constant EMERGENCY_CHECK_INTERVAL = 24 * 60 * 60; // 24 hours

    // Modifiers
    modifier onlyVerifier() {
        require(hasRole(VERIFIER_ROLE, msg.sender), "ProofVerifier: caller is not a verifier");
        _;
    }

    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "ProofVerifier: caller is not an operator");
        _;
    }

    modifier notEmergency() {
        require(!emergencyMode, "ProofVerifier: emergency mode active");
        _;
    }

    modifier validProofSize(bytes memory proof) {
        require(proof.length <= MAX_PROOF_SIZE, "ProofVerifier: proof size exceeds maximum");
        require(proof.length > 0, "ProofVerifier: empty proof");
        _;
    }

    modifier validPublicInputs(uint256[] memory publicInputs) {
        require(publicInputs.length <= MAX_PUBLIC_INPUTS, "ProofVerifier: too many public inputs");
        require(publicInputs.length > 0, "ProofVerifier: no public inputs");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        
        lastEmergencyCheck = block.timestamp;
        
        // Initialize default circuits
        _initializeDefaultCircuits();
    }

    /**
     * @dev Submit a ZK proof for verification
     * @param circuitId The circuit identifier
     * @param proof The ZK proof bytes
     * @param publicInputs The public inputs to the circuit
     * @param txHash The Bitcoin transaction hash
     * @return proofHash The hash of the submitted proof
     */
    function submitProof(
        bytes32 circuitId,
        bytes memory proof,
        uint256[] memory publicInputs,
        bytes32 txHash
    ) external 
        onlyOperator 
        whenNotPaused 
        notEmergency 
        validProofSize(proof) 
        validPublicInputs(publicInputs) 
        nonReentrant 
        returns (bytes32 proofHash) 
    {
        require(circuits[circuitId].active, "ProofVerifier: circuit not active");
        require(txHash != bytes32(0), "ProofVerifier: invalid transaction hash");
        
        // Check cooldown
        require(
            block.timestamp >= lastProofTime[txHash] + PROOF_COOLDOWN,
            "ProofVerifier: proof cooldown not met"
        );

        // Check proof size matches circuit expectation
        require(
            proof.length == circuits[circuitId].proofSize,
            "ProofVerifier: proof size mismatch"
        );

        // Check public inputs count
        require(
            publicInputs.length <= circuits[circuitId].maxPublicInputs,
            "ProofVerifier: too many public inputs for circuit"
        );

        proofHash = keccak256(abi.encodePacked(circuitId, proof, publicInputs, txHash, block.timestamp));
        
        require(proofs[proofHash].timestamp == 0, "ProofVerifier: duplicate proof");

        proofs[proofHash] = ZKProof({
            circuitId: circuitId,
            proof: proof,
            publicInputs: publicInputs,
            txHash: txHash,
            timestamp: block.timestamp,
            verified: false,
            valid: false,
            verifier: address(0)
        });

        lastProofTime[txHash] = block.timestamp;
        totalProofsSubmitted++;

        emit ProofSubmitted(proofHash, txHash, msg.sender, block.timestamp);

        return proofHash;
    }

    /**
     * @dev Verify a submitted ZK proof
     * @param proofHash The hash of the proof to verify
     * @return isValid True if the proof is valid
     */
    function verifyProof(bytes32 proofHash) 
        external 
        onlyVerifier 
        whenNotPaused 
        notEmergency 
        nonReentrant 
        returns (bool isValid) 
    {
        ZKProof storage proof = proofs[proofHash];
        require(proof.timestamp > 0, "ProofVerifier: proof does not exist");
        require(!proof.verified, "ProofVerifier: proof already verified");
        require(
            block.timestamp <= proof.timestamp + VERIFICATION_TIMEOUT,
            "ProofVerifier: verification timeout"
        );

        CircuitConfig storage circuit = circuits[proof.circuitId];
        require(circuit.active, "ProofVerifier: circuit not active");

        // Perform ZK proof verification
        isValid = _verifyZKProof(proof.circuitId, proof.proof, proof.publicInputs);

        proof.verified = true;
        proof.valid = isValid;
        proof.verifier = msg.sender;

        if (isValid) {
            totalProofsVerified++;
        } else {
            totalProofsRejected++;
        }

        emit ProofVerified(proofHash, proof.txHash, msg.sender, block.timestamp, isValid);

        return isValid;
    }

    /**
     * @dev Batch verify multiple proofs
     * @param proofHashes Array of proof hashes to verify
     * @return results Array of verification results
     */
    function batchVerifyProofs(bytes32[] memory proofHashes) 
        external 
        onlyVerifier 
        whenNotPaused 
        notEmergency 
        nonReentrant 
        returns (bool[] memory results) 
    {
        require(proofHashes.length > 0, "ProofVerifier: empty proof array");
        require(proofHashes.length <= 10, "ProofVerifier: too many proofs in batch");

        results = new bool[](proofHashes.length);

        for (uint256 i = 0; i < proofHashes.length; i++) {
            ZKProof storage proof = proofs[proofHashes[i]];
            require(proof.timestamp > 0, "ProofVerifier: proof does not exist");
            require(!proof.verified, "ProofVerifier: proof already verified");
            require(
                block.timestamp <= proof.timestamp + VERIFICATION_TIMEOUT,
                "ProofVerifier: verification timeout"
            );

            CircuitConfig storage circuit = circuits[proof.circuitId];
            require(circuit.active, "ProofVerifier: circuit not active");

            // Perform ZK proof verification
            bool isValid = _verifyZKProof(proof.circuitId, proof.proof, proof.publicInputs);

            proof.verified = true;
            proof.valid = isValid;
            proof.verifier = msg.sender;

            if (isValid) {
                totalProofsVerified++;
            } else {
                totalProofsRejected++;
            }

            emit ProofVerified(proofHashes[i], proof.txHash, msg.sender, block.timestamp, isValid);
            results[i] = isValid;
        }

        return results;
    }

    /**
     * @dev Get proof information
     * @param proofHash The hash of the proof
     * @return proof The proof struct
     */
    function getProof(bytes32 proofHash) external view returns (ZKProof memory proof) {
        require(proofs[proofHash].timestamp > 0, "ProofVerifier: proof does not exist");
        return proofs[proofHash];
    }

    /**
     * @dev Check if a proof is verified and valid
     * @param proofHash The hash of the proof
     * @return isVerified True if the proof is verified
     * @return isValid True if the proof is valid
     */
    function isProofValid(bytes32 proofHash) external view returns (bool isVerified, bool isValid) {
        ZKProof memory proof = proofs[proofHash];
        return (proof.verified, proof.valid);
    }

    /**
     * @dev Update circuit configuration
     * @param circuitId The circuit identifier
     * @param verificationKey The new verification key
     * @param maxPublicInputs The maximum number of public inputs
     * @param proofSize The expected proof size
     * @param active Whether the circuit is active
     */
    function updateCircuit(
        bytes32 circuitId,
        bytes32 verificationKey,
        uint256 maxPublicInputs,
        uint256 proofSize,
        bool active
    ) external onlyRole(ADMIN_ROLE) {
        require(verificationKey != bytes32(0), "ProofVerifier: invalid verification key");
        require(maxPublicInputs > 0 && maxPublicInputs <= MAX_PUBLIC_INPUTS, "ProofVerifier: invalid max public inputs");
        require(proofSize > 0 && proofSize <= MAX_PROOF_SIZE, "ProofVerifier: invalid proof size");

        circuits[circuitId] = CircuitConfig({
            verificationKey: verificationKey,
            maxPublicInputs: maxPublicInputs,
            proofSize: proofSize,
            active: active,
            lastUpdated: block.timestamp
        });

        emit VerificationKeyUpdated(circuitId, msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        emergencyMode = true;
        _pause();
    }

    /**
     * @dev Resume from emergency mode
     */
    function resume() external onlyRole(ADMIN_ROLE) {
        require(emergencyMode, "ProofVerifier: not in emergency mode");
        require(block.timestamp >= lastEmergencyCheck + EMERGENCY_CHECK_INTERVAL, "ProofVerifier: emergency check interval not met");
        
        emergencyMode = false;
        _unpause();
        lastEmergencyCheck = block.timestamp;
    }

    /**
     * @dev Get statistics
     * @return submitted Total proofs submitted
     * @return verified Total proofs verified
     * @return rejected Total proofs rejected
     */
    function getStatistics() external view returns (
        uint256 submitted,
        uint256 verified,
        uint256 rejected
    ) {
        return (totalProofsSubmitted, totalProofsVerified, totalProofsRejected);
    }

    /**
     * @dev Add verifier role to an address
     * @param verifier The address to add verifier role to
     */
    function addVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        _grantRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @dev Remove verifier role from an address
     * @param verifier The address to remove verifier role from
     */
    function removeVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        _revokeRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @dev Internal function to verify ZK proof
     * @param circuitId The circuit identifier
     * @param proof The ZK proof
     * @param publicInputs The public inputs
     * @return isValid True if the proof is valid
     */
    function _verifyZKProof(
        bytes32 circuitId,
        bytes memory proof,
        uint256[] memory publicInputs
    ) internal view returns (bool isValid) {
        // This is a simplified verification function
        // In a real implementation, you would:
        // 1. Load the verification key for the circuit
        // 2. Perform the actual ZK proof verification
        // 3. Return the result
        
        // For demo purposes, we'll implement a basic check
        CircuitConfig memory circuit = circuits[circuitId];
        
        // Basic validation checks
        if (proof.length != circuit.proofSize) {
            return false;
        }
        
        if (publicInputs.length > circuit.maxPublicInputs) {
            return false;
        }
        
        // Simulate proof verification (replace with actual verification logic)
        // In practice, you would use a library like snarkjs or implement
        // the verification algorithm directly
        
        // For now, we'll use a simple hash-based validation
        bytes32 proofHash = keccak256(abi.encodePacked(circuitId, proof, publicInputs));
        uint256 proofValue = uint256(proofHash) % 100;
        
        // 90% success rate for demo purposes
        return proofValue < 90;
    }

    /**
     * @dev Initialize default circuits
     */
    function _initializeDefaultCircuits() internal {
        // Bitcoin transaction verification circuit
        circuits[keccak256("bitcoin_tx_verify")] = CircuitConfig({
            verificationKey: keccak256("bitcoin_tx_vk"),
            maxPublicInputs: 16,
            proofSize: 256,
            active: true,
            lastUpdated: block.timestamp
        });

        // Merkle proof verification circuit
        circuits[keccak256("merkle_proof_verify")] = CircuitConfig({
            verificationKey: keccak256("merkle_proof_vk"),
            maxPublicInputs: 8,
            proofSize: 128,
            active: true,
            lastUpdated: block.timestamp
        });

        // Bridge transaction circuit
        circuits[keccak256("bridge_tx_verify")] = CircuitConfig({
            verificationKey: keccak256("bridge_tx_vk"),
            maxPublicInputs: 24,
            proofSize: 384,
            active: true,
            lastUpdated: block.timestamp
        });
    }
}
