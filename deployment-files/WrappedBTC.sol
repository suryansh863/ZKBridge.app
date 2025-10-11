// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title WrappedBTC
 * @dev ERC20 token representing Bitcoin on Ethereum
 * @notice This token is minted when Bitcoin is locked and burned when Bitcoin is unlocked
 */
contract WrappedBTC is 
    ERC20, 
    ERC20Burnable, 
    ERC20Pausable, 
    ERC20Votes, 
    AccessControl, 
    ReentrancyGuard 
{

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Constants
    uint256 public constant MAX_SUPPLY = 21000000 * 10**8; // 21 million BTC with 8 decimals
    uint256 public constant INITIAL_SUPPLY = 0;
    uint256 public constant MIN_MINT_AMOUNT = 100; // Minimum 100 satoshis
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**8; // Maximum 1 million BTC per transaction

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

    // State variables
    address public bridgeContract;
    uint256 public totalLockedBitcoin; // Total Bitcoin locked (in satoshis)
    uint256 public totalMintedTokens; // Total tokens minted
    
    // Circuit breaker
    bool public emergencyMode = false;
    uint256 public lastEmergencyCheck;
    uint256 public constant EMERGENCY_CHECK_INTERVAL = 24 * 60 * 60; // 24 hours

    // Modifiers
    modifier onlyBridge() {
        require(msg.sender == bridgeContract, "WrappedBTC: caller is not the bridge contract");
        _;
    }

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "WrappedBTC: caller is not a minter");
        _;
    }

    modifier onlyBurner() {
        require(hasRole(BURNER_ROLE, msg.sender), "WrappedBTC: caller is not a burner");
        _;
    }

    modifier notEmergency() {
        require(!emergencyMode, "WrappedBTC: emergency mode active");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount >= MIN_MINT_AMOUNT, "WrappedBTC: amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "WrappedBTC: amount above maximum");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address admin
    ) ERC20(name, symbol) EIP712(name, "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        lastEmergencyCheck = block.timestamp;
        
        // Mint initial supply if specified
        if (INITIAL_SUPPLY > 0) {
            _mint(admin, INITIAL_SUPPLY);
            totalMintedTokens = INITIAL_SUPPLY;
        }
    }

    /**
     * @dev Set the bridge contract address
     * @param _bridgeContract The address of the bridge contract
     */
    function setBridgeContract(address _bridgeContract) external onlyRole(ADMIN_ROLE) {
        require(_bridgeContract != address(0), "WrappedBTC: invalid bridge address");
        bridgeContract = _bridgeContract;
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
    ) external onlyBridge validAmount(amount) whenNotPaused notEmergency nonReentrant {
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
    ) external onlyBridge validAmount(amount) whenNotPaused notEmergency nonReentrant {
        require(from != address(0), "WrappedBTC: burn from zero address");
        require(balanceOf(from) >= amount, "WrappedBTC: insufficient balance");

        _burn(from, amount);
        totalLockedBitcoin = totalLockedBitcoin - amount;
        totalMintedTokens = totalMintedTokens - amount;

        emit BitcoinUnlocked(from, amount, btcTxHash, btcAddress);
    }

    /**
     * @dev Emergency mint function (only in emergency mode)
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function emergencyMint(address to, uint256 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenPaused 
    {
        require(emergencyMode, "WrappedBTC: not in emergency mode");
        require(to != address(0), "WrappedBTC: mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "WrappedBTC: would exceed max supply");

        _mint(to, amount);
        totalMintedTokens = totalMintedTokens + amount;
    }

    /**
     * @dev Emergency burn function (only in emergency mode)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function emergencyBurn(address from, uint256 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenPaused 
    {
        require(emergencyMode, "WrappedBTC: not in emergency mode");
        require(from != address(0), "WrappedBTC: burn from zero address");
        require(balanceOf(from) >= amount, "WrappedBTC: insufficient balance");

        _burn(from, amount);
        totalMintedTokens = totalMintedTokens - amount;
    }

    /**
     * @dev Update mint limits
     * @param minAmount The new minimum mint amount
     * @param maxAmount The new maximum mint amount
     */
    function updateMintLimits(uint256 minAmount, uint256 maxAmount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(minAmount > 0, "WrappedBTC: invalid min amount");
        require(maxAmount > minAmount, "WrappedBTC: max must be greater than min");
        require(maxAmount <= MAX_SUPPLY, "WrappedBTC: max amount too high");

        // Emit event for the new limits (constants can't be changed, but we can track the intent)
        emit MintLimitsUpdated(minAmount, maxAmount);
    }

    /**
     * @dev Get the current mint limits
     * @return minAmount The minimum mint amount
     * @return maxAmount The maximum mint amount
     */
    function getMintLimits() external pure returns (uint256 minAmount, uint256 maxAmount) {
        return (MIN_MINT_AMOUNT, MAX_MINT_AMOUNT);
    }

    /**
     * @dev Get total locked Bitcoin amount
     * @return amount The total amount of Bitcoin locked (in satoshis)
     */
    function getTotalLockedBitcoin() external view returns (uint256 amount) {
        return totalLockedBitcoin;
    }

    /**
     * @dev Get total minted tokens
     * @return amount The total amount of tokens minted
     */
    function getTotalMintedTokens() external view returns (uint256 amount) {
        return totalMintedTokens;
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
        require(emergencyMode, "WrappedBTC: not in emergency mode");
        require(block.timestamp >= lastEmergencyCheck + EMERGENCY_CHECK_INTERVAL, "WrappedBTC: emergency check interval not met");
        
        emergencyMode = false;
        _unpause();
        lastEmergencyCheck = block.timestamp;
    }

    /**
     * @dev Emergency withdraw function for stuck tokens
     * @param token The token contract address (address(0) for ETH)
     * @param amount The amount to withdraw
     * @param to The address to send the tokens to
     */
    function emergencyWithdraw(address token, uint256 amount, address to) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenPaused 
    {
        require(emergencyMode, "WrappedBTC: not in emergency mode");
        require(to != address(0), "WrappedBTC: invalid recipient");

        if (token == address(0)) {
            // Withdraw ETH
            require(address(this).balance >= amount, "WrappedBTC: insufficient ETH balance");
            payable(to).transfer(amount);
        } else {
            // Withdraw ERC20 tokens
            IERC20(token).transfer(to, amount);
        }

        emit EmergencyWithdraw(token, amount, to);
    }

    /**
     * @dev Override _update to include pausable and votes functionality
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable, ERC20Votes) {
        super._update(from, to, value);
    }

    /**
     * @dev Add minter role to an address
     * @param minter The address to add minter role to
     */
    function addMinter(address minter) external onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Remove minter role from an address
     * @param minter The address to remove minter role from
     */
    function removeMinter(address minter) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Add burner role to an address
     * @param burner The address to add burner role to
     */
    function addBurner(address burner) external onlyRole(ADMIN_ROLE) {
        _grantRole(BURNER_ROLE, burner);
    }

    /**
     * @dev Remove burner role from an address
     * @param burner The address to remove burner role from
     */
    function removeBurner(address burner) external onlyRole(ADMIN_ROLE) {
        _revokeRole(BURNER_ROLE, burner);
    }

}
