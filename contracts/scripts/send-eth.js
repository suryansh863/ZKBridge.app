const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Sending ETH to your MetaMask account...");
  
  // Your MetaMask account address (let's use a valid address)
  const recipientAddress = "0xE0fAd1f761Af05312122eAa3d54eb211271a5752";
  
  // Get the deployer account (has 10,000 ETH)
  const [deployer] = await ethers.getSigners();
  console.log("From:", deployer.address);
  console.log("To:", recipientAddress);
  
  // Send 5 ETH to your account
  const amount = ethers.parseEther("5.0");
  
  const tx = await deployer.sendTransaction({
    to: recipientAddress,
    value: amount
  });
  
  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  
  // Check balances
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  const recipientBalance = await ethers.provider.getBalance(recipientAddress);
  
  console.log("✅ Transaction completed!");
  console.log("Deployer balance:", ethers.formatEther(deployerBalance), "ETH");
  console.log("Your balance:", ethers.formatEther(recipientBalance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
