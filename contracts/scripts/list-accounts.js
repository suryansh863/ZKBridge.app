const { ethers } = require("hardhat");

async function main() {
  console.log("📋 Hardhat Localhost Accounts and Balances:");
  console.log("==========================================");
  
  // Get all signers (accounts)
  const signers = await ethers.getSigners();
  
  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    const balance = await ethers.provider.getBalance(signer.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`Account ${i}:`);
    console.log(`  Address: ${signer.address}`);
    console.log(`  Balance: ${balanceInEth} ETH`);
    console.log(`  Private Key: ${process.env.PRIVATE_KEY || 'Not available'}`);
    console.log("");
  }
  
  console.log("💡 You can import any of these accounts into MetaMask using their private keys.");
  console.log("💡 Account 0 (the deployer) has the most ETH and is used for deployments.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });







