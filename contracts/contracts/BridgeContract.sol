// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // Constants
    uint256 public constant MIN_BRIDGE_AMOUNT = 1000; // Minimum 1000 satoshis
    uint256 public constant MAX_BRIDGE_AMOUNT = 1000000 * 10**8; // Maximum 1 million BTC
    uint256 public constant BRIDGE_FEE_BASIS_POINTS = 30; // 0.3% bridge fee
    uint256 public constant MAX_FEE_BASIS_POINTS = 1000; // Maximum 10% fee

    // Events
    event BridgeInitiated(
        bytes32 indexed bridgeId,
        address indexed user,
        uint256 indexed amount,
        bytes32 btcTxHash,
        string btcAddress,
        uint256 timestamp
    );

    event UnwrapInitiated(
        bytes32 indexed unwrapId,
        address indexed user,
        uint256 indexed amount,
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

    event UnwrapCompleted(
        bytes32 indexed unwrapId,
        address indexed user,
        uint256 indexed amount,
        string btcAddress,
        bytes32 btcTxHash,
        uint256 timestamp
    );

    event BridgeCancelled(
        bytes32 indexed bridgeId,
        address indexed user,
        uint256 indexed amount,
        string reason,
        uint256 timestamp
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee, address indexed updater, uint256 timestamp);
    event LimitsUpdated(uint256 minAmount, uint256 maxAmount, address indexed updater, uint256 timestamp);

    // Enums
    enum BridgeStatus {
        Pending,        // Waiting for Bitcoin transaction
        Processing,     // Bitcoin transaction verified, processing
        Completed,      // Successfully bridged to Ethereum
        Cancelled,      // Bridge cancelled
        Failed          // Bridge failed
    }

    enum UnwrapStatus {
        Pending,        // Locked wBTC, waiting for Bitcoin release proof
        Completed,      // Proved Bitcoin was released, wBTC is burned
        Failed          // Failed to process unwrap
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
        bytes32 merkleProof;
        bytes32 zkProof;
        bool verified;
    }

    struct UnwrapTransaction {
        bytes32 unwrapId;
        address user;
        uint256 amount;
        string btcAddress;
        bytes32 unlockingTxHash;
        UnwrapStatus status;
        uint256 timestamp;
        uint256 processedAt;
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
    mapping(bytes32 => UnwrapTransaction) public unwraps; // unwrapId => UnwrapTransaction
    mapping(bytes32 => bool) public processedTxHashes; // btcTxHash => processed
    mapping(address => bytes32[]) public userBridges; // user => bridgeIds
    mapping(address => bytes32[]) public userUnwraps; // user => unwrapIds
    
    BTCRelay public btcRelay;
    WrappedBTC public wrappedBTC;
    ProofVerifier public proofVerifier;
    
    uint256 public bridgeFeeBasisPoints = BRIDGE_FEE_BASIS_POINTS;
    uint256 public minBridgeAmount = MIN_BRIDGE_AMOUNT;
    uint256 public maxBridgeAmount = MAX_BRIDGE_AMOUNT;
    
    BridgeStats public stats;

    uint256 public lastEmergencyCheck;
    uint256 public constant EMERGENCY_CHECK_INTERVAL = 24 * 60 * 60; // 24 hours

    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "BridgeContract: caller is not an operator");
        _;
    }

    modifier onlyRelayer() {
        require(hasRole(RELAYER_ROLE, msg.sender), "BridgeContract: caller is not a relayer");
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
        require(_btcRelay != address(0), "BridgeContract: invalid BTCRelay");
        require(_wrappedBTC != address(0), "BridgeContract: invalid WrappedBTC");
        require(_proofVerifier != address(0), "BridgeContract: invalid ProofVerifier");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);

        btcRelay = BTCRelay(_btcRelay);
        wrappedBTC = WrappedBTC(_wrappedBTC);
        proofVerifier = ProofVerifier(_proofVerifier);
    }

    /**
     * @dev Initiate a bridge (BTC to wBTC)
     */
    function initiateBridge(
        uint256 amount,
        bytes32 btcTxHash,
        string calldata btcAddress,
        string calldata ethAddress
    ) external 
        onlyOperator 
        whenNotPaused 
        validAmount(amount) 
        nonReentrant 
        returns (bytes32 bridgeId) 
    {
        require(btcTxHash != bytes32(0), "BridgeContract: invalid btc hash");
        require(bytes(btcAddress).length > 0, "BridgeContract: invalid btc address");
        require(bytes(ethAddress).length == 42, "BridgeContract: invalid eth address");
        require(!processedTxHashes[btcTxHash], "BridgeContract: already processed");

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
     * @dev Process bridge (BTC to wBTC)
     */
    function processBridge(
        bytes32 bridgeId,
        bytes32 merkleProof,
        bytes32 zkProof
    ) external 
        onlyRelayer 
        whenNotPaused 
        validBridge(bridgeId) 
        nonReentrant 
    {
        BridgeTransaction storage bridge = bridges[bridgeId];
        require(bridge.status == BridgeStatus.Pending, "BridgeContract: invalid status");

        require(btcRelay.isTransactionVerified(bridge.btcTxHash), "BridgeContract: BTC TX missing SPV verification");

        (bool verified, bool valid) = proofVerifier.isProofValid(zkProof);
        require(verified && valid, "BridgeContract: invalid ZK proof");
        
        ProofVerifier.ZKProof memory proofData = proofVerifier.getProof(zkProof);
        
        // CIRCUIT CONVENTION: publicInputs[0] MUST be the gross BTC amount
        // in satoshis (bridge.amount + bridge.fee). Any circuit change that
        // shifts signal ordering will break this check silently.
        require(proofData.publicInputs.length > 0 && proofData.publicInputs[0] == bridge.amount + bridge.fee, "BridgeContract: amount mismatch with proof");

        bridge.status = BridgeStatus.Processing;
        bridge.processedAt = block.timestamp;
        bridge.merkleProof = merkleProof;
        bridge.zkProof = zkProof;
        bridge.verified = true;

        wrappedBTC.mint(
            _parseEthAddress(bridge.ethAddress),
            bridge.amount,
            bridge.btcTxHash,
            bridge.btcAddress
        );

        bridge.status = BridgeStatus.Completed;
        stats.activeBridges--;
        stats.completedBridges++;

        emit BridgeCompleted(bridgeId, _parseEthAddress(bridge.ethAddress), bridge.amount, bridge.fee, block.timestamp);
    }

    /**
     * @dev Initiate unwrapping wBTC -> BTC (transfers wBTC to this contract to lock)
     */
    function initiateUnwrap(
        uint256 amount,
        string calldata btcAddress
    ) external 
        whenNotPaused 
        validAmount(amount) 
        nonReentrant 
        returns (bytes32 unwrapId) 
    {
        require(bytes(btcAddress).length > 0, "BridgeContract: invalid btc address");

        // Lock user's wBTC into the bridge contract
        IERC20(address(wrappedBTC)).safeTransferFrom(msg.sender, address(this), amount);

        unwrapId = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            btcAddress,
            block.timestamp,
            block.number
        ));

        require(unwraps[unwrapId].timestamp == 0, "BridgeContract: duplicate unwrap");

        unwraps[unwrapId] = UnwrapTransaction({
            unwrapId: unwrapId,
            user: msg.sender,
            amount: amount,
            btcAddress: btcAddress,
            unlockingTxHash: bytes32(0),
            status: UnwrapStatus.Pending,
            timestamp: block.timestamp,
            processedAt: 0
        });

        userUnwraps[msg.sender].push(unwrapId);
        emit UnwrapInitiated(unwrapId, msg.sender, amount, btcAddress, block.timestamp);
        return unwrapId;
    }

    /**
     * @dev Process unwrap once BTC transaction proves funds were released
     */
    function processUnwrap(
        bytes32 unwrapId,
        bytes32 unlockingTxHash,
        bytes32 zkProof
    ) external 
        onlyRelayer 
        whenNotPaused 
        nonReentrant 
    {
        UnwrapTransaction storage unwrap = unwraps[unwrapId];
        require(unwrap.status == UnwrapStatus.Pending, "BridgeContract: unwrap not pending");
        require(!processedTxHashes[unlockingTxHash], "BridgeContract: unlocking TX already processed");

        // SPV Proof requirement
        require(btcRelay.isTransactionVerified(unlockingTxHash), "BridgeContract: BTC TX missing SPV verification");

        // ZK Proof requirement
        (bool verified, bool valid) = proofVerifier.isProofValid(zkProof);
        require(verified && valid, "BridgeContract: invalid ZK proof");
        
        ProofVerifier.ZKProof memory proofData = proofVerifier.getProof(zkProof);
        require(proofData.publicInputs.length > 0 && proofData.publicInputs[0] == unwrap.amount, "BridgeContract: amount mismatch");

        // Burn the locked wBTC since the real BTC has successfully been processed on the other side
        wrappedBTC.burn(
            address(this),
            unwrap.amount,
            unlockingTxHash,
            unwrap.btcAddress
        );

        unwrap.unlockingTxHash = unlockingTxHash;
        unwrap.status = UnwrapStatus.Completed;
        unwrap.processedAt = block.timestamp;
        
        processedTxHashes[unlockingTxHash] = true;

        emit UnwrapCompleted(unwrapId, unwrap.user, unwrap.amount, unwrap.btcAddress, unlockingTxHash, block.timestamp);
    }

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

        emit BridgeCancelled(bridgeId, _parseEthAddress(bridge.ethAddress), bridge.amount, reason, block.timestamp);
    }

    function updateBridgeFee(uint256 newFeeBasisPoints) external onlyRole(ADMIN_ROLE) {
        require(newFeeBasisPoints <= MAX_FEE_BASIS_POINTS, "BridgeContract: fee too high");
        uint256 oldFee = bridgeFeeBasisPoints;
        bridgeFeeBasisPoints = newFeeBasisPoints;
        emit FeeUpdated(oldFee, newFeeBasisPoints, msg.sender, block.timestamp);
    }

    function updateBridgeLimits(
        uint256 newMinAmount,
        uint256 newMaxAmount
    ) external onlyRole(ADMIN_ROLE) {
        require(newMinAmount > 0, "BridgeContract: invalid min");
        require(newMaxAmount > newMinAmount, "BridgeContract: invalid max");
        require(newMaxAmount <= MAX_BRIDGE_AMOUNT, "BridgeContract: limits too high");

        minBridgeAmount = newMinAmount;
        maxBridgeAmount = newMaxAmount;
        emit LimitsUpdated(newMinAmount, newMaxAmount, msg.sender, block.timestamp);
    }

    function getBridge(bytes32 bridgeId) external view returns (BridgeTransaction memory) {
        require(bridges[bridgeId].timestamp > 0, "BridgeContract: does not exist");
        return bridges[bridgeId];
    }

    function getUnwrap(bytes32 unwrapId) external view returns (UnwrapTransaction memory) {
        require(unwraps[unwrapId].timestamp > 0, "BridgeContract: does not exist");
        return unwraps[unwrapId];
    }

    function getUserBridges(address user) external view returns (bytes32[] memory) {
        return userBridges[user];
    }

    function getUserUnwraps(address user) external view returns (bytes32[] memory) {
        return userUnwraps[user];
    }

    function isTransactionProcessed(bytes32 btcTxHash) external view returns (bool) {
        return processedTxHashes[btcTxHash];
    }

    /**
     * @dev Emergency pausing of ENTIRE BRIDGE SUITE
     */
    function emergencyPauseAll() external onlyRole(ADMIN_ROLE) {
        lastEmergencyCheck = block.timestamp;
        _pause();
        wrappedBTC.emergencyPause();
        // Assume BTCRelay has been given a uniform pause endpoint or we explicitly target it
        btcRelay.emergencyPause();
    }

    function resumeAll() external onlyRole(ADMIN_ROLE) {
        _unpause();
        // Note: For resumes, admin handles them manually on children contracts or we define standard endpoints
    }

    /**
     * @dev Internal helper bridging exact string hex formats to native EVM address types (C5 Support)
     */
    function _parseEthAddress(string memory _addressString) internal pure returns (address) {
        bytes memory stringBytes = bytes(_addressString);
        require(stringBytes.length == 42, "BridgeContract: invalid eth address length");
        require(stringBytes[0] == '0' && (stringBytes[1] == 'x' || stringBytes[1] == 'X'), "BridgeContract: invalid hex prefix");
        
        uint160 result = 0;
        for (uint256 i = 2; i < 42; i++) {
            uint160 char = uint160(uint8(stringBytes[i]));
            if (char >= 48 && char <= 57) {
                result = result * 16 + (char - 48); // 0-9
            } else if (char >= 65 && char <= 70) {
                result = result * 16 + (char - 55); // A-F
            } else if (char >= 97 && char <= 102) {
                result = result * 16 + (char - 87); // a-f
            } else {
                revert("BridgeContract: invalid hex character");
            }
        }
        require(result != 0, "BridgeContract: zero address");
        return address(result);
    }

    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external onlyRole(ADMIN_ROLE) whenPaused {
        require(to != address(0), "BridgeContract: invalid recipient");

        if (token == address(0)) {
            require(address(this).balance >= amount, "BridgeContract: insufficient ETH");
            (bool success, ) = to.call{value: amount}("");
            require(success, "BridgeContract: ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    function addOperator(address operator) external onlyRole(ADMIN_ROLE) {
        _grantRole(OPERATOR_ROLE, operator);
    }

    function removeOperator(address operator) external onlyRole(ADMIN_ROLE) {
        _revokeRole(OPERATOR_ROLE, operator);
    }

    function addRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _grantRole(RELAYER_ROLE, relayer);
    }

    function removeRelayer(address relayer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(RELAYER_ROLE, relayer);
    }

    receive() external payable {}
}
