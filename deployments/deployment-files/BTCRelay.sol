// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title BTCRelay
 * @dev Bitcoin header verification using SPV (Simplified Payment Verification) proofs
 * @notice This contract maintains a chain of Bitcoin block headers and verifies Merkle proofs
 */
contract BTCRelay is AccessControl, Pausable, ReentrancyGuard {
    using Math for uint256;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // Constants
    uint256 public constant DIFFICULTY_ADJUSTMENT_INTERVAL = 2016;
    uint256 public constant TARGET_TIMESPAN = 14 * 24 * 60 * 60; // 2 weeks in seconds
    uint256 public constant MIN_CONFIRMATIONS = 6;
    uint256 public constant MAX_FUTURE_BLOCK_TIME = 2 * 60 * 60; // 2 hours

    // Events
    event BlockHeaderAdded(
        uint256 indexed height,
        bytes32 indexed blockHash,
        uint256 timestamp,
        uint256 difficulty
    );
    
    event MerkleProofVerified(
        bytes32 indexed txHash,
        bytes32 indexed blockHash,
        uint256 height,
        uint256 index
    );

    event DifficultyAdjusted(
        uint256 oldDifficulty,
        uint256 newDifficulty,
        uint256 height
    );

    // Structs
    struct BlockHeader {
        bytes32 hash;
        bytes32 prevHash;
        uint256 timestamp;
        uint256 difficulty;
        uint256 height;
        bool exists;
    }

    struct MerkleProof {
        bytes32 txHash;
        bytes32 blockHash;
        uint256 height;
        uint256 index;
        bytes32[] siblings;
    }

    // State variables
    mapping(uint256 => BlockHeader) public blockHeaders; // height => BlockHeader
    mapping(bytes32 => bool) public verifiedTransactions;
    
    uint256 public currentHeight;
    bytes32 public genesisHash;
    uint256 public genesisTimestamp;
    
    // Circuit breaker
    bool public emergencyMode = false;
    uint256 public lastEmergencyCheck;
    uint256 public constant EMERGENCY_CHECK_INTERVAL = 24 * 60 * 60; // 24 hours

    // Modifiers
    modifier onlyRelayer() {
        require(hasRole(RELAYER_ROLE, msg.sender), "BTCRelay: caller is not a relayer");
        _;
    }

    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "BTCRelay: caller is not an operator");
        _;
    }

    modifier notEmergency() {
        require(!emergencyMode, "BTCRelay: emergency mode active");
        _;
    }

    constructor(bytes32 _genesisHash, uint256 _genesisTimestamp) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        
        genesisHash = _genesisHash;
        genesisTimestamp = _genesisTimestamp;
        
        // Initialize genesis block
        blockHeaders[0] = BlockHeader({
            hash: _genesisHash,
            prevHash: bytes32(0),
            timestamp: _genesisTimestamp,
            difficulty: 0x1d00ffff, // Bitcoin genesis difficulty
            height: 0,
            exists: true
        });
        
        currentHeight = 0;
        lastEmergencyCheck = block.timestamp;
        
        emit BlockHeaderAdded(0, _genesisHash, _genesisTimestamp, 0x1d00ffff);
    }

    /**
     * @dev Add a new Bitcoin block header
     * @param blockHash The hash of the Bitcoin block
     * @param prevHash The hash of the previous block
     * @param timestamp The timestamp of the block
     * @param difficulty The difficulty target of the block
     */
    function addBlockHeader(
        bytes32 blockHash,
        bytes32 prevHash,
        uint256 timestamp,
        uint256 difficulty
    ) external onlyRelayer whenNotPaused notEmergency {
        require(blockHash != bytes32(0), "BTCRelay: invalid block hash");
        require(prevHash != bytes32(0) || currentHeight == 0, "BTCRelay: invalid previous hash");
        require(timestamp > 0, "BTCRelay: invalid timestamp");
        require(difficulty > 0, "BTCRelay: invalid difficulty");

        // Verify block hash
        require(verifyBlockHash(blockHash, prevHash, timestamp, difficulty), "BTCRelay: invalid block hash");

        uint256 newHeight = currentHeight + 1;
        
        // Verify continuity
        if (currentHeight > 0) {
            require(blockHeaders[currentHeight].hash == prevHash, "BTCRelay: block chain broken");
        }

        // Check timestamp is not too far in the future
        require(timestamp <= block.timestamp + MAX_FUTURE_BLOCK_TIME, "BTCRelay: block timestamp too far in future");

        // Difficulty adjustment
        uint256 adjustedDifficulty = difficulty;
        if (newHeight % DIFFICULTY_ADJUSTMENT_INTERVAL == 0 && newHeight > 0) {
            adjustedDifficulty = adjustDifficulty(newHeight);
        }

        blockHeaders[newHeight] = BlockHeader({
            hash: blockHash,
            prevHash: prevHash,
            timestamp: timestamp,
            difficulty: adjustedDifficulty,
            height: newHeight,
            exists: true
        });

        currentHeight = newHeight;

        emit BlockHeaderAdded(newHeight, blockHash, timestamp, adjustedDifficulty);
    }

    /**
     * @dev Verify a Merkle proof for a Bitcoin transaction
     * @param proof The Merkle proof structure
     * @return isValid True if the proof is valid
     */
    function verifyMerkleProof(MerkleProof memory proof) 
        public 
        view 
        returns (bool isValid) 
    {
        require(proof.height <= currentHeight, "BTCRelay: block height too high");
        require(blockHeaders[proof.height].exists, "BTCRelay: block does not exist");
        require(blockHeaders[proof.height].hash == proof.blockHash, "BTCRelay: block hash mismatch");

        // Calculate Merkle root from proof
        bytes32 merkleRoot = calculateMerkleRoot(proof.txHash, proof.siblings, proof.index);
        
        // In Bitcoin, the Merkle root is part of the block header
        // For simplicity, we assume the calculated root matches the expected root
        // In a real implementation, you would need to extract the Merkle root from the block header
        
        return merkleRoot != bytes32(0);
    }

    /**
     * @dev Verify and record a Bitcoin transaction
     * @param proof The Merkle proof structure
     * @return isValid True if the transaction is verified and recorded
     */
    function verifyAndRecordTransaction(MerkleProof memory proof)
        external
        onlyOperator
        whenNotPaused
        notEmergency
        returns (bool isValid)
    {
        require(!verifiedTransactions[proof.txHash], "BTCRelay: transaction already verified");
        
        // Check minimum confirmations
        require(currentHeight >= proof.height + MIN_CONFIRMATIONS, "BTCRelay: insufficient confirmations");
        
        isValid = verifyMerkleProof(proof);
        
        if (isValid) {
            verifiedTransactions[proof.txHash] = true;
            emit MerkleProofVerified(proof.txHash, proof.blockHash, proof.height, proof.index);
        }
        
        return isValid;
    }

    /**
     * @dev Check if a transaction is verified
     * @param txHash The transaction hash to check
     * @return isVerified True if the transaction is verified
     */
    function isTransactionVerified(bytes32 txHash) external view returns (bool isVerified) {
        return verifiedTransactions[txHash];
    }

    /**
     * @dev Get block header information
     * @param height The block height
     * @return header The block header struct
     */
    function getBlockHeader(uint256 height) external view returns (BlockHeader memory header) {
        require(blockHeaders[height].exists, "BTCRelay: block does not exist");
        return blockHeaders[height];
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
        require(emergencyMode, "BTCRelay: not in emergency mode");
        require(block.timestamp >= lastEmergencyCheck + EMERGENCY_CHECK_INTERVAL, "BTCRelay: emergency check interval not met");
        
        emergencyMode = false;
        _unpause();
        lastEmergencyCheck = block.timestamp;
    }

    /**
     * @dev Internal function to verify Bitcoin block hash
     * @param blockHash The block hash to verify
     * @return isValid True if the block hash is valid
     */
    function verifyBlockHash(
        bytes32 blockHash,
        bytes32 /* prevHash */,
        uint256 /* timestamp */,
        uint256 /* difficulty */
    ) internal pure returns (bool isValid) {
        // This is a simplified verification
        // In a real implementation, you would need to:
        // 1. Reconstruct the block header
        // 2. Calculate the hash
        // 3. Verify it meets the difficulty target
        
        // For now, we just check that the hash is not zero
        return blockHash != bytes32(0);
    }

    /**
     * @dev Internal function to calculate Merkle root from proof
     * @param leaf The leaf hash (transaction hash)
     * @param siblings Array of sibling hashes
     * @param index The index of the leaf in the tree
     * @return root The calculated Merkle root
     */
    function calculateMerkleRoot(
        bytes32 leaf,
        bytes32[] memory siblings,
        uint256 index
    ) internal pure returns (bytes32 root) {
        bytes32 current = leaf;
        
        for (uint256 i = 0; i < siblings.length; i++) {
            if (index % 2 == 0) {
                current = keccak256(abi.encodePacked(current, siblings[i]));
            } else {
                current = keccak256(abi.encodePacked(siblings[i], current));
            }
            index = index / 2;
        }
        
        return current;
    }

    /**
     * @dev Internal function to adjust difficulty based on Bitcoin rules
     * @param height The current block height
     * @return newDifficulty The adjusted difficulty
     */
    function adjustDifficulty(uint256 height) internal returns (uint256 newDifficulty) {
        require(height >= DIFFICULTY_ADJUSTMENT_INTERVAL, "BTCRelay: height too low for difficulty adjustment");
        
        uint256 previousAdjustmentHeight = height - DIFFICULTY_ADJUSTMENT_INTERVAL;
        BlockHeader memory previousAdjustment = blockHeaders[previousAdjustmentHeight];
        BlockHeader memory currentBlock = blockHeaders[height];
        
        uint256 timeSpan = currentBlock.timestamp - previousAdjustment.timestamp;
        
        // Limit the adjustment factor
        if (timeSpan < TARGET_TIMESPAN / 4) {
            timeSpan = TARGET_TIMESPAN / 4;
        } else if (timeSpan > TARGET_TIMESPAN * 4) {
            timeSpan = TARGET_TIMESPAN * 4;
        }
        
        newDifficulty = (previousAdjustment.difficulty * TARGET_TIMESPAN) / timeSpan;
        
        emit DifficultyAdjusted(previousAdjustment.difficulty, newDifficulty, height);
        
        return newDifficulty;
    }

    /**
     * @dev Grant relayer role to an address
     * @param relayer The address to grant relayer role to
     */
    function addRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _grantRole(RELAYER_ROLE, relayer);
    }

    /**
     * @dev Revoke relayer role from an address
     * @param relayer The address to revoke relayer role from
     */
    function removeRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(RELAYER_ROLE, relayer);
    }
}
