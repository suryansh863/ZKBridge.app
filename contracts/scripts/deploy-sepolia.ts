import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting deployment of BridgeSpark contracts to Sepolia testnet...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("📊 Deployment Configuration:");
  console.log("  Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.1")) {
    console.warn("\n⚠️  WARNING: Low balance! Get Sepolia ETH from:");
    console.warn("  - https://sepoliafaucet.com/");
    console.warn("  - https://www.alchemy.com/faucets/ethereum-sepolia");
  }

  // Deployment parameters
  const GENESIS_HASH = "0x000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943"; // Bitcoin testnet genesis
  const GENESIS_TIMESTAMP = 1296688602; // Bitcoin testnet genesis timestamp
  const TOKEN_NAME = process.env.TOKEN_NAME || "BridgeSpark Bitcoin";
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "BSBTC";

  console.log("\n📝 Contract Parameters:");
  console.log("  Token Name:", TOKEN_NAME);
  console.log("  Token Symbol:", TOKEN_SYMBOL);
  console.log("  Genesis Hash:", GENESIS_HASH);
  console.log("  Genesis Timestamp:", GENESIS_TIMESTAMP);

  const deploymentResults: any = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deployerBalance: ethers.formatEther(balance),
    deployedAt: new Date().toISOString(),
    contracts: {} as any,
    gasUsed: {} as any,
    parameters: {
      genesisHash: GENESIS_HASH,
      genesisTimestamp: GENESIS_TIMESTAMP,
      tokenName: TOKEN_NAME,
      tokenSymbol: TOKEN_SYMBOL
    }
  };

  try {
    // 1. Deploy BTCRelay
    console.log("\n📡 Step 1/4: Deploying BTCRelay...");
    const BTCRelayFactory = await ethers.getContractFactory("BTCRelay");
    const btcRelay = await BTCRelayFactory.deploy(GENESIS_HASH, GENESIS_TIMESTAMP);
    await btcRelay.waitForDeployment();
    const btcRelayAddress = await btcRelay.getAddress();
    const btcRelayReceipt = await btcRelay.deploymentTransaction()?.wait();
    
    deploymentResults.contracts.BTCRelay = btcRelayAddress;
    deploymentResults.gasUsed.BTCRelay = btcRelayReceipt?.gasUsed.toString();
    
    console.log("  ✅ BTCRelay deployed to:", btcRelayAddress);
    console.log("  ⛽ Gas used:", btcRelayReceipt?.gasUsed.toString());

    // 2. Deploy WrappedBTC
    console.log("\n💰 Step 2/4: Deploying WrappedBTC...");
    const WrappedBTCFactory = await ethers.getContractFactory("WrappedBTC");
    const wrappedBTC = await WrappedBTCFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL, deployer.address);
    await wrappedBTC.waitForDeployment();
    const wrappedBTCAddress = await wrappedBTC.getAddress();
    const wrappedBTCReceipt = await wrappedBTC.deploymentTransaction()?.wait();
    
    deploymentResults.contracts.WrappedBTC = wrappedBTCAddress;
    deploymentResults.gasUsed.WrappedBTC = wrappedBTCReceipt?.gasUsed.toString();
    
    console.log("  ✅ WrappedBTC deployed to:", wrappedBTCAddress);
    console.log("  ⛽ Gas used:", wrappedBTCReceipt?.gasUsed.toString());

    // 3. Deploy ProofVerifier
    console.log("\n🔐 Step 3/4: Deploying ProofVerifier...");
    const ProofVerifierFactory = await ethers.getContractFactory("ProofVerifier");
    const proofVerifier = await ProofVerifierFactory.deploy();
    await proofVerifier.waitForDeployment();
    const proofVerifierAddress = await proofVerifier.getAddress();
    const proofVerifierReceipt = await proofVerifier.deploymentTransaction()?.wait();
    
    deploymentResults.contracts.ProofVerifier = proofVerifierAddress;
    deploymentResults.gasUsed.ProofVerifier = proofVerifierReceipt?.gasUsed.toString();
    
    console.log("  ✅ ProofVerifier deployed to:", proofVerifierAddress);
    console.log("  ⛽ Gas used:", proofVerifierReceipt?.gasUsed.toString());

    // 4. Deploy BridgeContract
    console.log("\n🌉 Step 4/4: Deploying BridgeContract...");
    const BridgeContractFactory = await ethers.getContractFactory("BridgeContract");
    const bridgeContract = await BridgeContractFactory.deploy(
      btcRelayAddress,
      wrappedBTCAddress,
      proofVerifierAddress
    );
    await bridgeContract.waitForDeployment();
    const bridgeContractAddress = await bridgeContract.getAddress();
    const bridgeContractReceipt = await bridgeContract.deploymentTransaction()?.wait();
    
    deploymentResults.contracts.BridgeContract = bridgeContractAddress;
    deploymentResults.gasUsed.BridgeContract = bridgeContractReceipt?.gasUsed.toString();
    
    console.log("  ✅ BridgeContract deployed to:", bridgeContractAddress);
    console.log("  ⛽ Gas used:", bridgeContractReceipt?.gasUsed.toString());

    // 5. Configure contracts
    console.log("\n⚙️  Configuring contracts...");
    
    console.log("  Setting up WrappedBTC...");
    const setBridgeTx = await wrappedBTC.setBridgeContract(bridgeContractAddress);
    await setBridgeTx.wait();
    console.log("  ✅ Bridge contract set in WrappedBTC");

    console.log("  Granting roles in BTCRelay...");
    const relayerRole = await btcRelay.RELAYER_ROLE();
    const operatorRole = await btcRelay.OPERATOR_ROLE();
    await (await btcRelay.grantRole(relayerRole, deployer.address)).wait();
    await (await btcRelay.grantRole(operatorRole, deployer.address)).wait();
    console.log("  ✅ Roles granted in BTCRelay");

    console.log("  Granting roles in BridgeContract...");
    const bridgeOperatorRole = await bridgeContract.OPERATOR_ROLE();
    const bridgeRelayerRole = await bridgeContract.RELAYER_ROLE();
    await (await bridgeContract.grantRole(bridgeOperatorRole, deployer.address)).wait();
    await (await bridgeContract.grantRole(bridgeRelayerRole, deployer.address)).wait();
    console.log("  ✅ Roles granted in BridgeContract");

    console.log("  Granting roles in ProofVerifier...");
    const verifierRole = await proofVerifier.VERIFIER_ROLE();
    const proofOperatorRole = await proofVerifier.OPERATOR_ROLE();
    await (await proofVerifier.grantRole(verifierRole, deployer.address)).wait();
    await (await proofVerifier.grantRole(proofOperatorRole, deployer.address)).wait();
    console.log("  ✅ Roles granted in ProofVerifier");

    // 6. Verify deployments
    console.log("\n🔍 Verifying contract state...");
    
    const btcRelayGenesis = await btcRelay.genesisHash();
    console.log("  BTCRelay genesis hash:", btcRelayGenesis);
    
    const wrappedBTCName = await wrappedBTC.name();
    const wrappedBTCSymbol = await wrappedBTC.symbol();
    console.log("  WrappedBTC:", wrappedBTCName, `(${wrappedBTCSymbol})`);
    
    const bridgeFee = await bridgeContract.bridgeFeeBasisPoints();
    console.log("  Bridge fee:", bridgeFee.toString(), "basis points");
    
    const minAmount = await bridgeContract.minBridgeAmount();
    const maxAmount = await bridgeContract.maxBridgeAmount();
    console.log("  Bridge limits:", ethers.formatUnits(minAmount, 8), "-", ethers.formatUnits(maxAmount, 8), "BTC");

    // 7. Calculate total gas used
    const totalGasUsed = Object.values(deploymentResults.gasUsed).reduce(
      (sum: bigint, gas: any) => sum + BigInt(gas), 
      BigInt(0)
    );
    deploymentResults.totalGasUsed = totalGasUsed.toString();
    deploymentResults.blockNumber = await ethers.provider.getBlockNumber();

    // 8. Save deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `sepolia-${Date.now()}.json`);
    const latestFile = path.join(deploymentsDir, "sepolia-latest.json");
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    fs.writeFileSync(latestFile, JSON.stringify(deploymentResults, null, 2));
    
    console.log("\n💾 Deployment info saved to:");
    console.log("  ", deploymentFile);
    console.log("  ", latestFile);

    // 9. Generate environment variable file for backend
    const envContent = `
# Smart Contract Addresses (Sepolia Testnet)
ETHEREUM_NETWORK="sepolia"
BTC_RELAY_ADDRESS="${btcRelayAddress}"
WRAPPED_BTC_ADDRESS="${wrappedBTCAddress}"
PROOF_VERIFIER_ADDRESS="${proofVerifierAddress}"
BRIDGE_CONTRACT_ADDRESS="${bridgeContractAddress}"
ETHEREUM_CHAIN_ID="11155111"
`;

    const backendEnvFile = path.join(__dirname, "../../.env.contracts");
    fs.writeFileSync(backendEnvFile, envContent.trim());
    console.log("  ", backendEnvFile);

    // 10. Print summary
    console.log("\n" + "=".repeat(80));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(80));
    console.log("\n🌐 Network Information:");
    console.log("  Network:", deploymentResults.network);
    console.log("  Chain ID:", deploymentResults.chainId);
    console.log("  Block Number:", deploymentResults.blockNumber);
    console.log("\n💼 Deployer:");
    console.log("  Address:", deploymentResults.deployer);
    console.log("  Balance:", deploymentResults.deployerBalance, "ETH");
    console.log("\n📜 Contract Addresses:");
    console.log("  BTCRelay:        ", deploymentResults.contracts.BTCRelay);
    console.log("  WrappedBTC:      ", deploymentResults.contracts.WrappedBTC);
    console.log("  ProofVerifier:   ", deploymentResults.contracts.ProofVerifier);
    console.log("  BridgeContract:  ", deploymentResults.contracts.BridgeContract);
    console.log("\n⛽ Gas Usage:");
    console.log("  BTCRelay:        ", deploymentResults.gasUsed.BTCRelay);
    console.log("  WrappedBTC:      ", deploymentResults.gasUsed.WrappedBTC);
    console.log("  ProofVerifier:   ", deploymentResults.gasUsed.ProofVerifier);
    console.log("  BridgeContract:  ", deploymentResults.gasUsed.BridgeContract);
    console.log("  TOTAL:           ", deploymentResults.totalGasUsed);
    console.log("\n" + "=".repeat(80));

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("  1. Verify contracts on Etherscan:");
    console.log(`     npx hardhat verify --network sepolia ${btcRelayAddress} "${GENESIS_HASH}" ${GENESIS_TIMESTAMP}`);
    console.log(`     npx hardhat verify --network sepolia ${wrappedBTCAddress} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" "${deployer.address}"`);
    console.log(`     npx hardhat verify --network sepolia ${proofVerifierAddress}`);
    console.log(`     npx hardhat verify --network sepolia ${bridgeContractAddress} "${btcRelayAddress}" "${wrappedBTCAddress}" "${proofVerifierAddress}"`);
    console.log("\n  2. Update backend .env file with contract addresses (already done in .env.contracts)");
    console.log("\n  3. Update frontend contract configuration");
    console.log("\n  4. Test bridge functionality on testnet");
    console.log("\n  5. Set up monitoring and alerts");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
