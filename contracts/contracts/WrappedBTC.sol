// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WrappedBTC
 * @dev ERC20 token representing Bitcoin on Ethereum
 * @notice This token is minted when Bitcoin is locked and burned when Bitcoin is unlocked
 */
using SafeERC20 for IERC20;
contract WrappedBTC is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ReentrancyGuard
{

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Constants
    uint256 public constant MAX_SUPPLY = 21000000 * 10**8; // 21 million BTC with 8 decimals
    uint256 public constant INITIAL_SUPPLY = 0;
    uint256 public MIN_MINT_AMOUNT = 100; // Minimum 100 satoshis
    uint256 public MAX_MINT_AMOUNT = 1000000 * 10**8; // Maximum 1 million BTC per transaction

    // Events
    event BitcoinLocked(
        address indexed user,
        uint256 indexed amount,
        bytes32 indexed btcTxHash,
        string btcAddress
    );
    
    event BitcoinUnlocked(
        address indexed user,
        uint256 indexed amount,
        bytes32 indexed btcTxHash,
        string btcAddress
    );

    event MintLimitsUpdated(
        uint256 minMintAmount,
        uint256 maxMintAmount
    );

    event EmergencyWithdraw(
        address indexed token,
        uint256 indexed amount,
        address indexed to
    );

    event BridgeContractProposed(address indexed pendingBridge, uint256 timelockExpiration);
    event BridgeContractAccepted(address indexed newBridge);

    // State variables
    address public bridgeContract;
    address public pendingBridgeContract;
    uint256 public bridgeContractChangeTime;
    uint256 public bridgeChangeDelay;

    uint256 public totalLockedBitcoin; // Total Bitcoin locked (in satoshis)
    uint256 public totalMintedTokens;  // Total tokens ever minted (analytics)
        
    // Circuit breaker
    uint256 public lastEmergencyCheck;
    uint256 public constant EMERGENCY_CHECK_INTERVAL = 24 * 60 * 60; // 24 hours

    // Modifiers
    modifier validAmount(uint256 amount) {
        require(amount >= MIN_MINT_AMOUNT, "WrappedBTC: amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "WrappedBTC: amount above maximum");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address admin,
        uint256 _bridgeChangeDelay
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        lastEmergencyCheck = block.timestamp;
        bridgeChangeDelay = _bridgeChangeDelay;
        
        // Mint initial supply if specified
        if (INITIAL_SUPPLY > 0) {
            _mint(admin, INITIAL_SUPPLY);
            totalMintedTokens = totalMintedTokens + INITIAL_SUPPLY;
        }
    }

    function decimals() public pure override returns (uint8) { return 8; }

    /**
     * @dev Propose a new bridge contract address with a 24h timelock
     * @param _bridgeContract The address of the new bridge contract
     */
    function proposeBridgeContract(address _bridgeContract) external onlyRole(ADMIN_ROLE) {
        require(_bridgeContract != address(0), "WrappedBTC: invalid bridge address");
        pendingBridgeContract = _bridgeContract;
        bridgeContractChangeTime = block.timestamp + bridgeChangeDelay;
        emit BridgeContractProposed(_bridgeContract, bridgeContractChangeTime);
    }

    /**
     * @dev Accept the proposed bridge contract after timelock expires
     */
    function acceptBridgeContract() external onlyRole(ADMIN_ROLE) {
        require(pendingBridgeContract != address(0), "WrappedBTC: no pending bridge");
        require(block.timestamp >= bridgeContractChangeTime, "WrappedBTC: timelock not expired");
        bridgeContract = pendingBridgeContract;
        pendingBridgeContract = address(0);
        emit BridgeContractAccepted(bridgeContract);
    }

    /**
     * @dev Initial deployment setup for bridge without timelock
     */
    function initializeBridgeContractFirstTime(address _bridgeContract) external onlyRole(ADMIN_ROLE) {
        require(bridgeContract == address(0), "WrappedBTC: already initialized");
        require(_bridgeContract != address(0), "WrappedBTC: invalid bridge address");
        bridgeContract = _bridgeContract;
        emit BridgeContractAccepted(_bridgeContract);
    }

    /**
     * @dev Mint tokens when Bitcoin is locked
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in satoshis)
     * @param btcTxHash The Bitcoin transaction hash
     * @param btcAddress The Bitcoin address that sent the transaction
     */
    function mint(
        address to,
        uint256 amount,
        bytes32 btcTxHash,
        string calldata btcAddress
    ) external onlyRole(MINTER_ROLE) validAmount(amount) whenNotPaused nonReentrant {
        require(to != address(0), "WrappedBTC: mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "WrappedBTC: would exceed max supply");

        _mint(to, amount);
        totalLockedBitcoin = totalLockedBitcoin + amount;
        totalMintedTokens = totalMintedTokens + amount;
        
        emit BitcoinLocked(to, amount, btcTxHash, btcAddress);
    }

    /**
     * @dev Burn tokens when Bitcoin is unlocked
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn (in satoshis)
     * @param btcTxHash The Bitcoin transaction hash for the unlock
     * @param btcAddress The Bitcoin address to receive the unlocked Bitcoin
     */
    function burn(
        address from,
        uint256 amount,
        bytes32 btcTxHash,
        string calldata btcAddress
    ) external onlyRole(BURNER_ROLE) validAmount(amount) whenNotPaused nonReentrant {
        require(from != address(0), "WrappedBTC: burn from zero address");
        require(balanceOf(from) >= amount, "WrappedBTC: insufficient balance");

        _burn(from, amount);
        totalLockedBitcoin = totalLockedBitcoin - amount;
        
        emit BitcoinUnlocked(from, amount, btcTxHash, btcAddress);
    }

    /**
     * @dev Emergency mint function (only in emergency mode)
     */
    function emergencyMint(address to, uint256 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenPaused 
    {
        require(to != address(0), "WrappedBTC: mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "WrappedBTC: would exceed max supply");

        _mint(to, amount);
        totalLockedBitcoin = totalLockedBitcoin + amount;
        totalMintedTokens = totalMintedTokens + amount;
    }

    /**
     * @dev Emergency burn function (only in emergency mode)
     */
    function emergencyBurn(address from, uint256 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenPaused 
    {
        require(from != address(0), "WrappedBTC: burn from zero address");
        require(balanceOf(from) >= amount, "WrappedBTC: insufficient balance");

        _burn(from, amount);
        totalLockedBitcoin = totalLockedBitcoin - amount;
    }

    /**
     * @dev Update mint limits
     */
    function updateMintLimits(uint256 minAmount, uint256 maxAmount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(minAmount > 0, "WrappedBTC: invalid min amount");
        require(maxAmount > minAmount, "WrappedBTC: max must be greater than min");
        require(maxAmount <= MAX_SUPPLY, "WrappedBTC: max amount too high");

        MIN_MINT_AMOUNT = minAmount;
        MAX_MINT_AMOUNT = maxAmount;
        emit MintLimitsUpdated(minAmount, maxAmount);
    }

    function getMintLimits() external view returns (uint256 minAmount, uint256 maxAmount) {
        return (MIN_MINT_AMOUNT, MAX_MINT_AMOUNT);
    }

    function getTotalLockedBitcoin() external view returns (uint256 amount) {
        return totalLockedBitcoin;
    }

    function getTotalMintedTokens() external view returns (uint256 amount) {
        return totalMintedTokens;
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyRole(PAUSER_ROLE) {
        lastEmergencyCheck = block.timestamp;
        _pause();
    }

    /**
     * @dev Resume from emergency mode
     */
    function resume() external onlyRole(ADMIN_ROLE) {
        require(block.timestamp >= lastEmergencyCheck + EMERGENCY_CHECK_INTERVAL, "WrappedBTC: emergency check interval not met");
        
        _unpause();
        lastEmergencyCheck = block.timestamp;
    }

    /**
     * @dev Emergency withdraw function for stuck tokens
     */
    function emergencyWithdraw(address token, uint256 amount, address to) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenPaused 
    {
        require(to != address(0), "WrappedBTC: invalid recipient");

        if (token == address(0)) {
            // Withdraw ETH
            require(address(this).balance >= amount, "WrappedBTC: insufficient ETH balance");
            payable(to).transfer(amount);
        } else {
            // Withdraw ERC20 tokens
            IERC20(token).safeTransfer(to, amount);
        }

        emit EmergencyWithdraw(token, amount, to);
    }

    /**
     * @dev Override _update to include pausable functionality
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    /**
     * @dev Add roles easily
     */
    function addMinter(address minter) external onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }
    
    function removeMinter(address minter) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }
    
    function addBurner(address burner) external onlyRole(ADMIN_ROLE) {
        _grantRole(BURNER_ROLE, burner);
    }
    
    function removeBurner(address burner) external onlyRole(ADMIN_ROLE) {
        _revokeRole(BURNER_ROLE, burner);
    }
}
