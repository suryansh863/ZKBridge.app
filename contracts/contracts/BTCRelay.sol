// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BTCRelay
 * @dev Bitcoin header verification using SPV (Simplified Payment Verification) proofs
 */
contract BTCRelay is AccessControl, Pausable, ReentrancyGuard {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    uint256 public constant DIFFICULTY_ADJUSTMENT_INTERVAL = 2016;
    uint256 public constant TARGET_TIMESPAN = 14 * 24 * 60 * 60; // 2 weeks in seconds
    uint256 public constant MIN_CONFIRMATIONS = 6;
    uint256 public constant MAX_FUTURE_BLOCK_TIME = 2 * 60 * 60; // 2 hours

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

    event ChainReorganized(
        bytes32 indexed oldTip,
        bytes32 indexed newTip,
        bytes32 commonAncestor
    );

    struct BlockHeader {
        bytes32 hash;
        bytes32 merkleRoot;
        bytes32 prevHash;
        uint256 timestamp;
        uint256 difficulty;
        uint256 height;
        uint256 chainWork;
        bool isMainChain;
        bool exists;
    }

    struct MerkleProof {
        bytes32 txHash;
        bytes32 blockHash;
        uint256 height;
        uint256 index;
        bytes32[] siblings;
    }

    mapping(bytes32 => BlockHeader) public blockHeaders;
    bytes32 public bestKnownDigest; 
    uint256 public currentHeight;
    mapping(bytes32 => bytes32) public verifiedTransactions; // txHash => blockHash
    
    bytes32 public genesisHash;
    uint256 public genesisTimestamp;
    
    uint256 public lastEmergencyCheck;
    uint256 public constant EMERGENCY_CHECK_INTERVAL = 24 * 60 * 60;

    modifier onlyRelayer() {
        require(hasRole(RELAYER_ROLE, msg.sender), "BTCRelay: not relayer");
        _;
    }

    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "BTCRelay: not operator");
        _;
    }

    constructor(bytes32 _genesisHash, uint256 _genesisTimestamp) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        
        genesisHash = _genesisHash;
        genesisTimestamp = _genesisTimestamp;
        
        blockHeaders[_genesisHash] = BlockHeader({
            hash: _genesisHash,
            prevHash: bytes32(0),
            merkleRoot: bytes32(0),
            timestamp: _genesisTimestamp,
            difficulty: 0x1d00ffff,
            height: 0,
            chainWork: 0x1d00ffff, 
            isMainChain: true,
            exists: true
        });
        bestKnownDigest = _genesisHash;
        currentHeight = 0;
        lastEmergencyCheck = block.timestamp;
    }

    function extractBytes32(bytes memory data, uint256 offset) internal pure returns (bytes32 result) {
        assembly {
            result := mload(add(add(data, 32), offset))
        }
    }

    function extractUint32LE(bytes memory data, uint256 offset) internal pure returns (uint32) {
        return uint32(uint8(data[offset])) |
               (uint32(uint8(data[offset+1])) << 8) |
               (uint32(uint8(data[offset+2])) << 16) |
               (uint32(uint8(data[offset+3])) << 24);
    }

    /**
     * @dev Add a new Bitcoin block header via exact 80 byte parsing
     */
    function addBlockHeader(bytes memory rawHeader) external onlyRelayer whenNotPaused {
        require(rawHeader.length == 80, "BTCRelay: invalid raw header length");

        // C4: Bitcoin specifically double hashes the 80 byte header
        bytes32 blockHash = sha256(abi.encodePacked(sha256(rawHeader)));
        require(!blockHeaders[blockHash].exists, "BTCRelay: block already exists");

        // Extract Standard Fields via slicing assembly
        bytes32 prevHash = extractBytes32(rawHeader, 4);
        bytes32 merkleRoot = extractBytes32(rawHeader, 36);
        uint256 timestamp = extractUint32LE(rawHeader, 68);
        uint256 bits = extractUint32LE(rawHeader, 72);

        require(prevHash != bytes32(0) || currentHeight == 0, "BTCRelay: invalid prev hash");
        BlockHeader memory prevBlock = blockHeaders[prevHash];
        require(prevBlock.exists, "BTCRelay: previous block missing");
        require(timestamp <= block.timestamp + MAX_FUTURE_BLOCK_TIME, "BTCRelay: future timestamp");

        uint256 newHeight = prevBlock.height + 1;
        uint256 adjustedDifficulty = bits; // Default to provided bits

        if (newHeight % DIFFICULTY_ADJUSTMENT_INTERVAL == 0 && newHeight > 0) {
            adjustedDifficulty = adjustDifficulty(prevHash, newHeight, timestamp);
            require(adjustedDifficulty == bits, "BTCRelay: invalid difficulty submitted");
        }

        uint256 newChainWork = prevBlock.chainWork + adjustedDifficulty;

        blockHeaders[blockHash] = BlockHeader({
            hash: blockHash,
            prevHash: prevHash,
            merkleRoot: merkleRoot,
            timestamp: timestamp,
            difficulty: adjustedDifficulty,
            height: newHeight,
            chainWork: newChainWork,
            isMainChain: false,
            exists: true
        });

        // H1 Fork and Reorg Resolution
        if (newChainWork > blockHeaders[bestKnownDigest].chainWork) {
            if (prevHash != bestKnownDigest) {
                _handleReorg(blockHash, bestKnownDigest);
            } else {
                blockHeaders[blockHash].isMainChain = true;
            }
            bestKnownDigest = blockHash;
            currentHeight = newHeight;
        }

        emit BlockHeaderAdded(newHeight, blockHash, timestamp, adjustedDifficulty);
    }

    function _handleReorg(bytes32 newTip, bytes32 oldTip) internal {
        bytes32 walkNew = newTip;
        bytes32 walkOld = oldTip;
        
        // Find common ancestor, cap reorg at ~144 blocks
        for (uint256 i = 0; i < 144; i++) {
            if (walkNew == walkOld) {
                emit ChainReorganized(oldTip, newTip, walkNew);
                return;
            }
            
            if (blockHeaders[walkNew].height > blockHeaders[walkOld].height) {
                blockHeaders[walkNew].isMainChain = true;
                walkNew = blockHeaders[walkNew].prevHash;
            } else if (blockHeaders[walkOld].height > blockHeaders[walkNew].height) {
                blockHeaders[walkOld].isMainChain = false;
                walkOld = blockHeaders[walkOld].prevHash;
            } else {
                blockHeaders[walkNew].isMainChain = true;
                blockHeaders[walkOld].isMainChain = false;
                walkNew = blockHeaders[walkNew].prevHash;
                walkOld = blockHeaders[walkOld].prevHash;
            }
        }
        
        revert("BTCRelay: reorg too deep");
    }

    function verifyMerkleProof(MerkleProof memory proof) public view returns (bool isValid) {
        require(blockHeaders[proof.blockHash].exists, "BTCRelay: block does not exist");
        bytes32 merkleRoot = calculateMerkleRoot(proof.txHash, proof.siblings, proof.index);
        return merkleRoot == blockHeaders[proof.blockHash].merkleRoot;
    }

    function verifyAndRecordTransaction(MerkleProof memory proof)
        external
        onlyOperator
        whenNotPaused
        returns (bool isValid)
    {
        require(verifiedTransactions[proof.txHash] == bytes32(0), "BTCRelay: transaction already verified");
        
        BlockHeader memory header = blockHeaders[proof.blockHash];
        require(header.isMainChain, "BTCRelay: block is not on main chain");
        require(currentHeight >= header.height + MIN_CONFIRMATIONS, "BTCRelay: insufficient confirmations");
        
        isValid = verifyMerkleProof(proof);
        
        if (isValid) {
            verifiedTransactions[proof.txHash] = proof.blockHash;
            emit MerkleProofVerified(proof.txHash, proof.blockHash, proof.height, proof.index);
        }
        
        return isValid;
    }

    /**
     * @dev Check if a transaction is verified and STILL securely on the active tip
     */
    function isTransactionVerified(bytes32 txHash) external view returns (bool isVerified) {
        bytes32 blockHash = verifiedTransactions[txHash];
        if (blockHash == bytes32(0)) return false;
        
        // If a reorg happens, old verified Txs will dynamically revert their validity
        return blockHeaders[blockHash].isMainChain;
    }

    function getBlockHeader(bytes32 blockHash) external view returns (BlockHeader memory header) {
        require(blockHeaders[blockHash].exists, "BTCRelay: block does not exist");
        return blockHeaders[blockHash];
    }

    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        lastEmergencyCheck = block.timestamp;
        _pause();
    }

    function resume() external onlyRole(ADMIN_ROLE) {
        require(block.timestamp >= lastEmergencyCheck + EMERGENCY_CHECK_INTERVAL, "BTCRelay: emergency check interval not met");
        _unpause();
        lastEmergencyCheck = block.timestamp;
    }

    function calculateMerkleRoot(
        bytes32 leaf,
        bytes32[] memory siblings,
        uint256 index
    ) internal pure returns (bytes32 root) {
        bytes32 current = leaf;
        
        for (uint256 i = 0; i < siblings.length; i++) {
            if (index % 2 == 0) {
                current = sha256(abi.encodePacked(sha256(abi.encodePacked(current, siblings[i]))));
            } else {
                current = sha256(abi.encodePacked(sha256(abi.encodePacked(siblings[i], current))));
            }
            index = index / 2;
        }
        
        return current;
    }

    function adjustDifficulty(bytes32 prevHash, uint256 /* height */, uint256 currentTimestamp) internal view returns (uint256 newDifficulty) {
        bytes32 walkBack = prevHash;
        for (uint256 i = 1; i < DIFFICULTY_ADJUSTMENT_INTERVAL; i++) {
            walkBack = blockHeaders[walkBack].prevHash;
        }
        
        BlockHeader memory previousAdjustment = blockHeaders[walkBack];
        uint256 timeSpan = currentTimestamp - previousAdjustment.timestamp;
        
        if (timeSpan < TARGET_TIMESPAN / 4) {
            timeSpan = TARGET_TIMESPAN / 4;
        } else if (timeSpan > TARGET_TIMESPAN * 4) {
            timeSpan = TARGET_TIMESPAN * 4;
        }
        
        newDifficulty = (previousAdjustment.difficulty * TARGET_TIMESPAN) / timeSpan;
        return newDifficulty;
    }

    function addRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _grantRole(RELAYER_ROLE, relayer);
    }

    function removeRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(RELAYER_ROLE, relayer);
    }
}
