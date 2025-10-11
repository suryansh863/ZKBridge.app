const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔍 Checking Sepolia balance for deployer:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceInEth = ethers.utils.formatEther(balance);
  
  console.log("💰 Current Sepolia ETH balance:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.01) {
    console.log("⚠️  Warning: Low balance! You need at least 0.01 ETH for deployment.");
    console.log("🔗 Get Sepolia ETH from: https://sepoliafaucet.com/");
  } else {
    console.log("✅ Sufficient balance for deployment!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error checking balance:", error);
    process.exit(1);
  });







