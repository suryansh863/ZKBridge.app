import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment of ZKBridge contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deployment parameters
  const GENESIS_HASH = "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
  const GENESIS_TIMESTAMP = 1231006505;
  const TOKEN_NAME = "ZK Bridge Bitcoin";
  const TOKEN_SYMBOL = "ZKBTC";

  try {
    // 1. Deploy BTCRelay
    console.log("\n📡 Deploying BTCRelay...");
    const BTCRelayFactory = await ethers.getContractFactory("BTCRelay");
    const btcRelay = await BTCRelayFactory.deploy(GENESIS_HASH, GENESIS_TIMESTAMP);
    await btcRelay.waitForDeployment();
    const btcRelayAddress = await btcRelay.getAddress();
    console.log("✅ BTCRelay deployed to:", btcRelayAddress);

    // 2. Deploy WrappedBTC
    console.log("\n💰 Deploying WrappedBTC...");
    const WrappedBTCFactory = await ethers.getContractFactory("WrappedBTC");
    const bridgeChangeDelay = 86400; // 24 hours for Mainnet default
    const wrappedBTC = await WrappedBTCFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL, deployer.address, bridgeChangeDelay);
    await wrappedBTC.waitForDeployment();
    const wrappedBTCAddress = await wrappedBTC.getAddress();
    console.log("✅ WrappedBTC deployed to:", wrappedBTCAddress);

    // 3. Deploy ProofVerifier
    console.log("\n🔐 Deploying ProofVerifier...");
    const ProofVerifierFactory = await ethers.getContractFactory("ProofVerifier");
    const proofVerifier = await ProofVerifierFactory.deploy();
    await proofVerifier.waitForDeployment();
    const proofVerifierAddress = await proofVerifier.getAddress();
    console.log("✅ ProofVerifier deployed to:", proofVerifierAddress);

    // 4. Deploy BridgeContract
    console.log("\n🌉 Deploying BridgeContract...");
    const BridgeContractFactory = await ethers.getContractFactory("BridgeContract");
    const bridgeContract = await BridgeContractFactory.deploy(
      btcRelayAddress,
      wrappedBTCAddress,
      proofVerifierAddress
    );
    await bridgeContract.waitForDeployment();
    const bridgeContractAddress = await bridgeContract.getAddress();
    console.log("✅ BridgeContract deployed to:", bridgeContractAddress);

    // 5. Configure contracts
    console.log("\n⚙️  Configuring contracts...");
    
    // Set bridge contract in WrappedBTC
    await wrappedBTC.initializeBridgeContractFirstTime(bridgeContractAddress);
    console.log("✅ Set bridge contract in WrappedBTC");

    // Grant MINTER_ROLE and BURNER_ROLE to BridgeContract
    await wrappedBTC.grantRole(await wrappedBTC.MINTER_ROLE(), bridgeContractAddress);
    await wrappedBTC.grantRole(await wrappedBTC.BURNER_ROLE(), bridgeContractAddress);
    console.log("✅ Granted MINTER_ROLE and BURNER_ROLE to BridgeContract");

    // Grant necessary roles
    await btcRelay.grantRole(await btcRelay.RELAYER_ROLE(), deployer.address);
    await btcRelay.grantRole(await btcRelay.OPERATOR_ROLE(), deployer.address);
    console.log("✅ Granted relayer and operator roles in BTCRelay");

    await bridgeContract.grantRole(await bridgeContract.OPERATOR_ROLE(), deployer.address);
    await bridgeContract.grantRole(await bridgeContract.RELAYER_ROLE(), deployer.address);
    console.log("✅ Granted operator and relayer roles in BridgeContract");

    await proofVerifier.grantRole(await proofVerifier.VERIFIER_ROLE(), deployer.address);
    await proofVerifier.grantRole(await proofVerifier.OPERATOR_ROLE(), deployer.address);
    console.log("✅ Granted verifier and operator roles in ProofVerifier");

    // 6. Verify deployments
    console.log("\n🔍 Verifying deployments...");
    
    const btcRelayGenesis = await btcRelay.genesisHash();
    console.log("BTCRelay genesis hash:", btcRelayGenesis);
    
    const wrappedBTCName = await wrappedBTC.name();
    const wrappedBTCSymbol = await wrappedBTC.symbol();
    console.log("WrappedBTC:", wrappedBTCName, "(", wrappedBTCSymbol, ")");
    
    const bridgeFee = await bridgeContract.bridgeFeeBasisPoints();
    console.log("Bridge fee:", bridgeFee.toString(), "basis points");
    
    const minAmount = await bridgeContract.minBridgeAmount();
    const maxAmount = await bridgeContract.maxBridgeAmount();
    console.log("Bridge limits:", ethers.formatUnits(minAmount, 8), "-", ethers.formatUnits(maxAmount, 8), "BTC");

    // 7. Save deployment info
    const deploymentInfo = {
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId,
      deployer: deployer.address,
      contracts: {
        BTCRelay: btcRelayAddress,
        WrappedBTC: wrappedBTCAddress,
        ProofVerifier: proofVerifierAddress,
        BridgeContract: bridgeContractAddress
      },
      parameters: {
        genesisHash: GENESIS_HASH,
        genesisTimestamp: GENESIS_TIMESTAMP,
        tokenName: TOKEN_NAME,
        tokenSymbol: TOKEN_SYMBOL,
        bridgeFeeBasisPoints: bridgeFee.toString(),
        minBridgeAmount: minAmount.toString(),
        maxBridgeAmount: maxAmount.toString()
      },
      deployedAt: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber()
    };

    console.log("\n📋 Deployment Summary:");
    console.log("Network:", deploymentInfo.network);
    console.log("Chain ID:", deploymentInfo.chainId.toString());
    console.log("Deployer:", deploymentInfo.deployer);
    console.log("Block Number:", deploymentInfo.blockNumber);
    console.log("\nContract Addresses:");
    console.log("- BTCRelay:", deploymentInfo.contracts.BTCRelay);
    console.log("- WrappedBTC:", deploymentInfo.contracts.WrappedBTC);
    console.log("- ProofVerifier:", deploymentInfo.contracts.ProofVerifier);
    console.log("- BridgeContract:", deploymentInfo.contracts.BridgeContract);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Configure relayer addresses");
    console.log("3. Set up monitoring and alerting");
    console.log("4. Test bridge functionality");
    console.log("5. Deploy frontend and backend services");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
