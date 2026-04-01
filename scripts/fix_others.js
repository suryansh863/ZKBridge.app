const fs = require('fs');

// 1. WrappedBTC
let wbtc = fs.readFileSync('contracts/contracts/WrappedBTC.sol', 'utf8');

wbtc = wbtc.replace('import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";\n', '');
wbtc = wbtc.replace('import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";\n', '');
wbtc = wbtc.replace('import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n', 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\nimport "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";\n');

wbtc = wbtc.replace(/ERC20Votes, /g, '');
wbtc = wbtc.replace(/ERC20Votes/g, '');
wbtc = wbtc.replace(/EIP712\(name, "1"\) \{/g, '{');
wbtc = wbtc.replace(/    using SafeERC20 for IERC20;\n/g, ''); // just in case
wbtc = wbtc.replace('contract WrappedBTC is ', 'contract WrappedBTC is\n    ERC20,\n    ERC20Burnable,\n    ERC20Pausable,\n    AccessControl,\n    ReentrancyGuard\n{');
wbtc = wbtc.replace('    ERC20, \n    ERC20Burnable, \n    ERC20Pausable, \n    AccessControl, \n    ReentrancyGuard \n{', '');

// SafeERC20
wbtc = wbtc.replace('contract WrappedBTC ', 'using SafeERC20 for IERC20;\ncontract WrappedBTC ');

// Remove MINTER and BURNER
wbtc = wbtc.replace(/bytes32 public constant MINTER_ROLE.*\n/g, '');
wbtc = wbtc.replace(/bytes32 public constant BURNER_ROLE.*\n/g, '');
wbtc = wbtc.replace(/_grantRole\(MINTER_ROLE, admin\);\n/g, '');
wbtc = wbtc.replace(/_grantRole\(BURNER_ROLE, admin\);\n/g, '');
wbtc = wbtc.replace(/modifier onlyMinter\(\) \{[\s\S]*?\}\n\n/g, '');
wbtc = wbtc.replace(/modifier onlyBurner\(\) \{[\s\S]*?\}\n\n/g, '');
wbtc = wbtc.replace(/function addMinter\([\s\S]*?\}\n\n/g, '');
wbtc = wbtc.replace(/function removeMinter\([\s\S]*?\}\n\n/g, '');
wbtc = wbtc.replace(/function addBurner\([\s\S]*?\}\n\n/g, '');
wbtc = wbtc.replace(/function removeBurner\([\s\S]*?\}\n/g, '');

// Fix constants
wbtc = wbtc.replace('uint256 public constant MIN_MINT_AMOUNT', 'uint256 public MIN_MINT_AMOUNT');
wbtc = wbtc.replace('uint256 public constant MAX_MINT_AMOUNT', 'uint256 public MAX_MINT_AMOUNT');

wbtc = wbtc.replace(
  '// Emit event for the new limits (constants can\'t be changed, but we can track the intent)\n        emit MintLimitsUpdated(minAmount, maxAmount);',
  'MIN_MINT_AMOUNT = minAmount;\n        MAX_MINT_AMOUNT = maxAmount;\n        emit MintLimitsUpdated(minAmount, maxAmount);'
);

// Decimals
wbtc = wbtc.replace(
  'function setBridgeContract(address _bridgeContract) external onlyRole(ADMIN_ROLE) {',
  'function decimals() public pure override returns (uint8) { return 8; }\n\n    function setBridgeContract(address _bridgeContract) external onlyRole(ADMIN_ROLE) {\n        require(bridgeContract == address(0), "WrappedBTC: bridge already set");'
);

// Remove totalMintedTokens tracking
wbtc = wbtc.replace(/uint256 public totalMintedTokens;.*\n/g, '');
wbtc = wbtc.replace(/totalMintedTokens = [^;]+;\n/g, '');
wbtc = wbtc.replace(/function getTotalMintedTokens\(\) external view returns \(uint256 amount\) \{\n        return totalMintedTokens;\n    \}/g, '');

// Emergency accounting
wbtc = wbtc.replace(
  '_mint(to, amount);\n    }',
  '_mint(to, amount);\n        totalLockedBitcoin = totalLockedBitcoin + amount;\n    }'
);
wbtc = wbtc.replace(
  '_burn(from, amount);\n    }',
  '_burn(from, amount);\n        totalLockedBitcoin = totalLockedBitcoin - amount;\n    }'
);

wbtc = wbtc.replace(
  'IERC20(token).transfer(to, amount);',
  'IERC20(token).safeTransfer(to, amount);'
);

wbtc = wbtc.replace(/bool public emergencyMode = false;\n    /g, '');
wbtc = wbtc.replace(/modifier notEmergency\(\) \{\n[\s\S]*?_\;\n    \}/g, '');
wbtc = wbtc.replace(/notEmergency /g, '');
wbtc = wbtc.replace(/require\(!emergencyMode, "WrappedBTC: emergency mode active"\);\n        /g, '');
wbtc = wbtc.replace(/require\(emergencyMode, "WrappedBTC: not in emergency mode"\);\n        /g, '');
wbtc = wbtc.replace(/emergencyMode = true;\n        /g, '');
wbtc = wbtc.replace(/emergencyMode = false;\n        /g, '');

fs.writeFileSync('contracts/contracts/WrappedBTC.sol', wbtc);

// 2. BridgeContract
let bridge = fs.readFileSync('contracts/contracts/BridgeContract.sol', 'utf8');

bridge = bridge.replace(/string ethAddress;/g, 'address ethAddress;');
bridge = bridge.replace(/string calldata ethAddress/g, 'address ethAddress');
bridge = bridge.replace(/bytes\(ethAddress\)\.length > 0/g, 'ethAddress != address(0)');
bridge = bridge.replace(/bridge\.user/g, 'bridge.ethAddress');
// Re-fix the emit BridgeInitiated and other places where bridge.user was referenced instead of bridge.user being the operator.
// The audit says: "Tokens minted to operator not user... bridge.user = msg.sender (the operator)... minted to bridge.user".
// My code already changed `wrappedBTC.mint(bridge.user, ...)` to `wrappedBTC.mint(bridge.ethAddress, ...)`. Wait, I haven't done it yet!
bridge = bridge.replace(
  'wrappedBTC.mint(\n            bridge.user,\n            bridge.amount',
  'wrappedBTC.mint(\n            bridge.ethAddress,\n            bridge.amount'
);

// M4 Amount check
bridge = bridge.replace(
  '(bool verified, bool valid) = proofVerifier.isProofValid(zkProof);\n        require(verified && valid, "BridgeContract: invalid ZK proof");',
  `(bool verified, bool valid) = proofVerifier.isProofValid(zkProof);
        require(verified && valid, "BridgeContract: invalid ZK proof");
        
        ProofVerifier.ZKProof memory proofData = proofVerifier.getProof(zkProof);
        require(proofData.publicInputs.length > 0 && proofData.publicInputs[0] == bridge.amount, "BridgeContract: amount mismatch");`
);

fs.writeFileSync('contracts/contracts/BridgeContract.sol', bridge);
