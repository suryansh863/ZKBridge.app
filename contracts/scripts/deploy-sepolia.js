const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting ZKBridge Sepolia Deployment...");
  console.log("=" .repeat(60));
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log("💰 Account balance:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.01) {
    console.log("⚠️  WARNING: Low balance! Deployment might fail.");
    console.log("💡 Get Sepolia ETH from: https://sepoliafaucet.com/");
    console.log("🔄 Continuing anyway...\n");
  }
  
  // Deployment addresses
  const deploymentAddresses = {};
  
  try {
    // 1. Deploy BTCRelay
    console.log("📦 Deploying BTCRelay...");
    const BTCRelay = await ethers.getContractFactory("BTCRelay");
    const btcRelay = await BTCRelay.deploy();
    await btcRelay.deployed();
    deploymentAddresses.BTCRelay = btcRelay.address;
    console.log("✅ BTCRelay deployed to:", btcRelay.address);
    
    // 2. Deploy WrappedBTC
    console.log("📦 Deploying WrappedBTC...");
    const WrappedBTC = await ethers.getContractFactory("WrappedBTC");
    const wrappedBTC = await WrappedBTC.deploy();
    await wrappedBTC.deployed();
    deploymentAddresses.WrappedBTC = wrappedBTC.address;
    console.log("✅ WrappedBTC deployed to:", wrappedBTC.address);
    
    // 3. Deploy ProofVerifier
    console.log("📦 Deploying ProofVerifier...");
    const ProofVerifier = await ethers.getContractFactory("ProofVerifier");
    const proofVerifier = await ProofVerifier.deploy();
    await proofVerifier.deployed();
    deploymentAddresses.ProofVerifier = proofVerifier.address;
    console.log("✅ ProofVerifier deployed to:", proofVerifier.address);
    
    // 4. Deploy BridgeContract
    console.log("📦 Deploying BridgeContract...");
    const BridgeContract = await ethers.getContractFactory("BridgeContract");
    const bridgeContract = await BridgeContract.deploy(
      btcRelay.address,
      wrappedBTC.address,
      proofVerifier.address
    );
    await bridgeContract.deployed();
    deploymentAddresses.BridgeContract = bridgeContract.address;
    console.log("✅ BridgeContract deployed to:", bridgeContract.address);
    
    // Display summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(60));
    console.log("📋 Contract Addresses:");
    console.log("   BTCRelay:", deploymentAddresses.BTCRelay);
    console.log("   WrappedBTC:", deploymentAddresses.WrappedBTC);
    console.log("   ProofVerifier:", deploymentAddresses.ProofVerifier);
    console.log("   BridgeContract:", deploymentAddresses.BridgeContract);
    
    // Save to file
    const fs = require('fs');
    const deploymentData = {
      network: "sepolia",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deploymentAddresses
    };
    
    fs.writeFileSync(
      '../deployment-sepolia.json', 
      JSON.stringify(deploymentData, null, 2)
    );
    
    console.log("\n💾 Deployment data saved to: deployment-sepolia.json");
    console.log("\n🔗 View on Sepolia Etherscan:");
    console.log("   BTCRelay: https://sepolia.etherscan.io/address/" + deploymentAddresses.BTCRelay);
    console.log("   WrappedBTC: https://sepolia.etherscan.io/address/" + deploymentAddresses.WrappedBTC);
    console.log("   ProofVerifier: https://sepolia.etherscan.io/address/" + deploymentAddresses.ProofVerifier);
    console.log("   BridgeContract: https://sepolia.etherscan.io/address/" + deploymentAddresses.BridgeContract);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Get Sepolia ETH from:");
      console.log("   • https://sepoliafaucet.com/");
      console.log("   • https://www.alchemy.com/faucets/ethereum-sepolia");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment error:", error);
    process.exit(1);
  });







