import { ethers } from "hardhat";
import { run } from "hardhat";

async function main() {
  console.log("🔍 Starting contract verification...");

  // Contract addresses (update these with your deployed addresses)
  const CONTRACT_ADDRESSES = {
    BTCRelay: "0x...", // Replace with actual address
    WrappedBTC: "0x...", // Replace with actual address
    ProofVerifier: "0x...", // Replace with actual address
    BridgeContract: "0x..." // Replace with actual address
  };

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

  try {
    // Verify BTCRelay
    if (CONTRACT_ADDRESSES.BTCRelay !== "0x...") {
      console.log("\n📡 Verifying BTCRelay...");
      await run("verify:verify", {
        address: CONTRACT_ADDRESSES.BTCRelay,
        constructorArguments: [
          "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f", // genesisHash
          1231006505 // genesisTimestamp
        ],
      });
      console.log("✅ BTCRelay verified");
    }

    // Verify WrappedBTC
    if (CONTRACT_ADDRESSES.WrappedBTC !== "0x...") {
      console.log("\n💰 Verifying WrappedBTC...");
      await run("verify:verify", {
        address: CONTRACT_ADDRESSES.WrappedBTC,
        constructorArguments: [
          "Wrapped Bitcoin", // name
          "WBTC", // symbol
          "0x..." // admin (replace with actual admin address)
        ],
      });
      console.log("✅ WrappedBTC verified");
    }

    // Verify ProofVerifier
    if (CONTRACT_ADDRESSES.ProofVerifier !== "0x...") {
      console.log("\n🔐 Verifying ProofVerifier...");
      await run("verify:verify", {
        address: CONTRACT_ADDRESSES.ProofVerifier,
        constructorArguments: [],
      });
      console.log("✅ ProofVerifier verified");
    }

    // Verify BridgeContract
    if (CONTRACT_ADDRESSES.BridgeContract !== "0x...") {
      console.log("\n🌉 Verifying BridgeContract...");
      await run("verify:verify", {
        address: CONTRACT_ADDRESSES.BridgeContract,
        constructorArguments: [
          CONTRACT_ADDRESSES.BTCRelay,
          CONTRACT_ADDRESSES.WrappedBTC,
          CONTRACT_ADDRESSES.ProofVerifier
        ],
      });
      console.log("✅ BridgeContract verified");
    }

    console.log("\n🎉 All contracts verified successfully!");

  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
