// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./BTCRelay.sol";
import "./WrappedBTC.sol";
import "./ProofVerifier.sol";

/**
 * @title BridgeContract
 * @dev Main contract for Bitcoin-Ethereum trustless bridge
 * @notice Orchestrates the entire bridging process between Bitcoin and Ethereum
 */
contract BridgeContract is AccessControl, Pausable, ReentrancyGuard {
    using Math for uint256;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // Constants
    uint256 public constant MIN_BRIDGE_AMOUNT = 1000; // Minimum 1000 satoshis
    uint256 public constant MAX_BRIDGE_AMOUNT = 1000000 * 10**8; // Maximum 1 million BTC
    uint256 public constant BRIDGE_FEE_BASIS_POINTS = 30; // 0.3% bridge fee
    uint256 public constant MAX_FEE_BASIS_POINTS = 1000; // Maximum 10% fee
    uint256 public constant PROCESSING_TIMEOUT = 24 * 60 * 60; // 24 hours
    uint256 public constant CLAIM_TIMEOUT = 7 * 24 * 60 * 60; // 7 days

    // Events
    event BridgeInitiated(
        bytes32 indexed bridgeId,
        address indexed user,
        uint256 indexed amount,
        bytes32 btcTxHash,
        string btcAddress,
        uint256 timestamp
    );

    event BridgeCompleted(
        bytes32 indexed bridgeId,
        address indexed user,
        uint256 indexed amount,
        uint256 fee,
        uint256 timestamp
    );

    event BridgeClaimed(
        bytes32 indexed bridgeId,
        address indexed user,
        uint256 indexed amount,
        string btcAddress,
        uint256 timestamp
    );

    event BridgeCancelled(
        bytes32 indexed bridgeId,
        address indexed user,
        uint256 indexed amount,
        string reason,
        uint256 timestamp
    );

    event FeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        address indexed updater,
        uint256 timestamp
    );

    event LimitsUpdated(
        uint256 minAmount,
        uint256 maxAmount,
        address indexed updater,
        uint256 timestamp
    );

    // Enums
    enum BridgeStatus {
        Pending,        // Waiting for Bitcoin transaction
        Processing,     // Bitcoin transaction verified, processing
        Completed,      // Successfully bridged to Ethereum
        Claimed,        // Bitcoin claimed from bridge
        Cancelled,      // Bridge cancelled
        Failed          // Bridge failed
    }

    // Structs
    struct BridgeTransaction {
        bytes32 bridgeId;
        address user;
        uint256 amount;
        uint256 fee;
        bytes32 btcTxHash;
        string btcAddress;
        string ethAddress;
        BridgeStatus status;
        uint256 timestamp;
        uint256 processedAt;
        uint256 claimedAt;
        bytes32 merkleProof;
        bytes32 zkProof;
        bool verified;
    }

    struct BridgeStats {
        uint256 totalBridges;
        uint256 totalVolume;
        uint256 totalFees;
        uint256 activeBridges;
        uint256 completedBridges;
        uint256 failedBridges;
    }

    // State variables
    mapping(bytes32 => BridgeTransaction) public bridges; // bridgeId => BridgeTransaction
    mapping(bytes32 => bool) public processedTxHashes; // btcTxHash => processed
    mapping(address => bytes32[]) public userBridges; // user => bridgeIds
    
    BTCRelay public btcRelay;
    WrappedBTC public wrappedBTC;
    ProofVerifier public proofVerifier;
    
    uint256 public bridgeFeeBasisPoints = BRIDGE_FEE_BASIS_POINTS;
    uint256 public minBridgeAmount = MIN_BRIDGE_AMOUNT;
    uint256 public maxBridgeAmount = MAX_BRIDGE_AMOUNT;
    
    BridgeStats public stats;
    
    // Circuit breaker
    bool public emergencyMode = false;
    uint256 public lastEmergencyCheck;
    uint256 public constant EMERGENCY_CHECK_INTERVAL = 24 * 60 * 60; // 24 hours

    // Modifiers
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "BridgeContract: caller is not an operator");
        _;
    }

    modifier onlyRelayer() {
        require(hasRole(RELAYER_ROLE, msg.sender), "BridgeContract: caller is not a relayer");
        _;
    }

    modifier notEmergency() {
        require(!emergencyMode, "BridgeContract: emergency mode active");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount >= minBridgeAmount, "BridgeContract: amount below minimum");
        require(amount <= maxBridgeAmount, "BridgeContract: amount above maximum");
        _;
    }

    modifier validBridge(bytes32 bridgeId) {
        require(bridges[bridgeId].timestamp > 0, "BridgeContract: bridge does not exist");
        _;
    }

    constructor(
        address _btcRelay,
        address _wrappedBTC,
        address _proofVerifier
    ) {
        require(_btcRelay != address(0), "BridgeContract: invalid BTCRelay address");
        require(_wrappedBTC != address(0), "BridgeContract: invalid WrappedBTC address");
        require(_proofVerifier != address(0), "BridgeContract: invalid ProofVerifier address");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);

        btcRelay = BTCRelay(_btcRelay);
        wrappedBTC = WrappedBTC(_wrappedBTC);
        proofVerifier = ProofVerifier(_proofVerifier);

        lastEmergencyCheck = block.timestamp;
    }

    /**
     * @dev Initiate a bridge transaction
     * @param amount The amount to bridge (in satoshis)
     * @param btcTxHash The Bitcoin transaction hash
     * @param btcAddress The Bitcoin address that sent the transaction
     * @param ethAddress The Ethereum address to receive wrapped BTC
     * @return bridgeId The unique bridge transaction ID
     */
    function initiateBridge(
        uint256 amount,
        bytes32 btcTxHash,
        string calldata btcAddress,
        string calldata ethAddress
    ) external 
        onlyOperator 
        whenNotPaused 
        notEmergency 
        validAmount(amount) 
        nonReentrant 
        returns (bytes32 bridgeId) 
    {
        require(btcTxHash != bytes32(0), "BridgeContract: invalid Bitcoin transaction hash");
        require(bytes(btcAddress).length > 0, "BridgeContract: invalid Bitcoin address");
        require(bytes(ethAddress).length > 0, "BridgeContract: invalid Ethereum address");
        require(!processedTxHashes[btcTxHash], "BridgeContract: transaction already processed");

        bridgeId = keccak256(abi.encodePacked(
            amount,
            btcTxHash,
            btcAddress,
            ethAddress,
            block.timestamp,
            block.number
        ));

        require(bridges[bridgeId].timestamp == 0, "BridgeContract: duplicate bridge");

        uint256 fee = amount * bridgeFeeBasisPoints / 10000;
        uint256 netAmount = amount - fee;

        bridges[bridgeId] = BridgeTransaction({
            bridgeId: bridgeId,
            user: msg.sender,
            amount: netAmount,
            fee: fee,
            btcTxHash: btcTxHash,
            btcAddress: btcAddress,
            ethAddress: ethAddress,
            status: BridgeStatus.Pending,
            timestamp: block.timestamp,
            processedAt: 0,
            claimedAt: 0,
            merkleProof: bytes32(0),
            zkProof: bytes32(0),
            verified: false
        });

        processedTxHashes[btcTxHash] = true;
        userBridges[msg.sender].push(bridgeId);

        stats.totalBridges++;
        stats.totalVolume = stats.totalVolume + amount;
        stats.totalFees = stats.totalFees + fee;
        stats.activeBridges++;

        emit BridgeInitiated(bridgeId, msg.sender, amount, btcTxHash, btcAddress, block.timestamp);

        return bridgeId;
    }

    /**
     * @dev Process a bridge transaction after Bitcoin verification
     * @param bridgeId The bridge transaction ID
     * @param merkleProof The Merkle proof hash
     * @param zkProof The ZK proof hash
     */
    function processBridge(
        bytes32 bridgeId,
        bytes32 merkleProof,
        bytes32 zkProof
    ) external 
        onlyRelayer 
        whenNotPaused 
        notEmergency 
        validBridge(bridgeId) 
        nonReentrant 
    {
        BridgeTransaction storage bridge = bridges[bridgeId];
        require(bridge.status == BridgeStatus.Pending, "BridgeContract: invalid bridge status");
        require(merkleProof != bytes32(0), "BridgeContract: invalid Merkle proof");
        require(zkProof != bytes32(0), "BridgeContract: invalid ZK proof");

        // Verify Bitcoin transaction
        require(btcRelay.isTransactionVerified(bridge.btcTxHash), "BridgeContract: Bitcoin transaction not verified");

        // Verify ZK proof
        (bool verified, bool valid) = proofVerifier.isProofValid(zkProof);
        require(verified && valid, "BridgeContract: invalid ZK proof");

        bridge.status = BridgeStatus.Processing;
        bridge.processedAt = block.timestamp;
        bridge.merkleProof = merkleProof;
        bridge.zkProof = zkProof;
        bridge.verified = true;

        // Mint wrapped BTC to user
        wrappedBTC.mint(
            bridge.user,
            bridge.amount,
            bridge.btcTxHash,
            bridge.btcAddress
        );

        bridge.status = BridgeStatus.Completed;
        stats.activeBridges--;
        stats.completedBridges++;

        emit BridgeCompleted(bridgeId, bridge.user, bridge.amount, bridge.fee, block.timestamp);
    }

    /**
     * @dev Claim Bitcoin from a completed bridge
     * @param bridgeId The bridge transaction ID
     * @param btcAddress The Bitcoin address to receive the funds
     */
    function claimBitcoin(
        bytes32 bridgeId,
        string calldata btcAddress
    ) external 
        onlyOperator 
        whenNotPaused 
        notEmergency 
        validBridge(bridgeId) 
        nonReentrant 
    {
        BridgeTransaction storage bridge = bridges[bridgeId];
        require(bridge.status == BridgeStatus.Completed, "BridgeContract: bridge not completed");
        require(bridge.claimedAt == 0, "BridgeContract: already claimed");
        require(bytes(btcAddress).length > 0, "BridgeContract: invalid Bitcoin address");

        bridge.status = BridgeStatus.Claimed;
        bridge.claimedAt = block.timestamp;

        emit BridgeClaimed(bridgeId, bridge.user, bridge.amount, btcAddress, block.timestamp);
    }

    /**
     * @dev Cancel a bridge transaction
     * @param bridgeId The bridge transaction ID
     * @param reason The reason for cancellation
     */
    function cancelBridge(
        bytes32 bridgeId,
        string calldata reason
    ) external 
        onlyRole(ADMIN_ROLE) 
        validBridge(bridgeId) 
        nonReentrant 
    {
        BridgeTransaction storage bridge = bridges[bridgeId];
        require(
            bridge.status == BridgeStatus.Pending || bridge.status == BridgeStatus.Processing,
            "BridgeContract: cannot cancel bridge"
        );

        bridge.status = BridgeStatus.Cancelled;
        stats.activeBridges--;
        stats.failedBridges++;

        emit BridgeCancelled(bridgeId, bridge.user, bridge.amount, reason, block.timestamp);
    }

    /**
     * @dev Update bridge fee
     * @param newFeeBasisPoints The new fee in basis points
     */
    function updateBridgeFee(uint256 newFeeBasisPoints) external onlyRole(ADMIN_ROLE) {
        require(newFeeBasisPoints <= MAX_FEE_BASIS_POINTS, "BridgeContract: fee too high");
        
        uint256 oldFee = bridgeFeeBasisPoints;
        bridgeFeeBasisPoints = newFeeBasisPoints;

        emit FeeUpdated(oldFee, newFeeBasisPoints, msg.sender, block.timestamp);
    }

    /**
     * @dev Update bridge limits
     * @param newMinAmount The new minimum bridge amount
     * @param newMaxAmount The new maximum bridge amount
     */
    function updateBridgeLimits(
        uint256 newMinAmount,
        uint256 newMaxAmount
    ) external onlyRole(ADMIN_ROLE) {
        require(newMinAmount > 0, "BridgeContract: invalid minimum amount");
        require(newMaxAmount > newMinAmount, "BridgeContract: invalid maximum amount");
        require(newMaxAmount <= MAX_BRIDGE_AMOUNT, "BridgeContract: maximum too high");

        minBridgeAmount = newMinAmount;
        maxBridgeAmount = newMaxAmount;

        emit LimitsUpdated(newMinAmount, newMaxAmount, msg.sender, block.timestamp);
    }

    /**
     * @dev Get bridge transaction details
     * @param bridgeId The bridge transaction ID
     * @return bridge The bridge transaction struct
     */
    function getBridge(bytes32 bridgeId) external view returns (BridgeTransaction memory bridge) {
        require(bridges[bridgeId].timestamp > 0, "BridgeContract: bridge does not exist");
        return bridges[bridgeId];
    }

    /**
     * @dev Get user's bridge transactions
     * @param user The user address
     * @return bridgeIds Array of bridge transaction IDs
     */
    function getUserBridges(address user) external view returns (bytes32[] memory bridgeIds) {
        return userBridges[user];
    }

    /**
     * @dev Get bridge statistics
     * @return stats The bridge statistics struct
     */
    function getBridgeStats() external view returns (BridgeStats memory) {
        return stats;
    }

    /**
     * @dev Check if a Bitcoin transaction is processed
     * @param btcTxHash The Bitcoin transaction hash
     * @return isProcessed True if the transaction is processed
     */
    function isTransactionProcessed(bytes32 btcTxHash) external view returns (bool isProcessed) {
        return processedTxHashes[btcTxHash];
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
        require(emergencyMode, "BridgeContract: not in emergency mode");
        require(block.timestamp >= lastEmergencyCheck + EMERGENCY_CHECK_INTERVAL, "BridgeContract: emergency check interval not met");
        
        emergencyMode = false;
        _unpause();
        lastEmergencyCheck = block.timestamp;
    }

    /**
     * @dev Emergency withdraw function for stuck funds
     * @param token The token contract address (address(0) for ETH)
     * @param amount The amount to withdraw
     * @param to The address to send the funds to
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external onlyRole(ADMIN_ROLE) whenPaused {
        require(emergencyMode, "BridgeContract: not in emergency mode");
        require(to != address(0), "BridgeContract: invalid recipient");

        if (token == address(0)) {
            // Withdraw ETH
            require(address(this).balance >= amount, "BridgeContract: insufficient ETH balance");
            payable(to).transfer(amount);
        } else {
            // Withdraw ERC20 tokens
            IERC20(token).transfer(to, amount);
        }
    }

    /**
     * @dev Add operator role to an address
     * @param operator The address to add operator role to
     */
    function addOperator(address operator) external onlyRole(ADMIN_ROLE) {
        _grantRole(OPERATOR_ROLE, operator);
    }

    /**
     * @dev Remove operator role from an address
     * @param operator The address to remove operator role from
     */
    function removeOperator(address operator) external onlyRole(ADMIN_ROLE) {
        _revokeRole(OPERATOR_ROLE, operator);
    }

    /**
     * @dev Add relayer role to an address
     * @param relayer The address to add relayer role to
     */
    function addRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _grantRole(RELAYER_ROLE, relayer);
    }

    /**
     * @dev Remove relayer role from an address
     * @param relayer The address to remove relayer role from
     */
    function removeRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(RELAYER_ROLE, relayer);
    }

    /**
     * @dev Receive ETH (for potential fees or emergency)
     */
    receive() external payable {
        // Accept ETH payments
    }
}
