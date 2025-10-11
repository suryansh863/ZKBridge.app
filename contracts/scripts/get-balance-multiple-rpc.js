const { ethers } = require("ethers");

async function checkBalanceWithMultipleRPCs() {
  const deployerAddress = "0x59e702a8b62b8f4B96a6369D5B46499eD6160D70";
  
  // Multiple RPC endpoints for Sepolia
  const rpcEndpoints = [
    "https://sepolia.infura.io/v3/z+XSQo3rhEwz6wIGyvZn0voj3EuvdFiWbJlyRimapjP5a00nWGsxwQ",
    "https://sepolia.drpc.org",
    "https://rpc.sepolia.org",
    "https://ethereum-sepolia.blockpi.network/v1/rpc/public"
  ];
  
  console.log("🔍 Checking Sepolia balance for:", deployerAddress);
  console.log("=" .repeat(50));
  
  for (let i = 0; i < rpcEndpoints.length; i++) {
    try {
      console.log(`\n📡 Trying RPC ${i + 1}: ${rpcEndpoints[i].substring(0, 30)}...`);
      
      const provider = new ethers.providers.JsonRpcProvider(rpcEndpoints[i]);
      const balance = await provider.getBalance(deployerAddress);
      const balanceInEth = ethers.utils.formatEther(balance);
      
      console.log(`✅ Balance: ${balanceInEth} ETH`);
      
      if (parseFloat(balanceInEth) >= 0.01) {
        console.log("🎉 Sufficient balance for deployment!");
        return { success: true, balance: balanceInEth, rpc: rpcEndpoints[i] };
      } else {
        console.log("⚠️  Low balance - need at least 0.01 ETH");
      }
    } catch (error) {
      console.log(`❌ RPC ${i + 1} failed: ${error.message}`);
    }
  }
  
  console.log("\n💡 Get Sepolia ETH from:");
  console.log("   • https://sepoliafaucet.com/");
  console.log("   • https://faucet.quicknode.com/ethereum/sepolia");
  console.log("   • https://www.alchemy.com/faucets/ethereum-sepolia");
  
  return { success: false };
}

checkBalanceWithMultipleRPCs()
  .then((result) => {
    if (result.success) {
      console.log("\n🚀 Ready for deployment!");
    } else {
      console.log("\n⏳ Please get Sepolia ETH first, then try again.");
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error);
  });







