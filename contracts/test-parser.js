const { ethers } = require("hardhat");

async function main() {
    console.log("Compiling TestParser...");
    const TestParserFactory = await ethers.getContractFactory("TestParser");
    const testParser = await TestParserFactory.deploy();
    await testParser.waitForDeployment();
    
    console.log("Deployed TestParser to:", await testParser.getAddress());

    const tests = [
        { name: "Should revert (not 42 chars)", input: "0xabc", expectRevert: true, revertMsg: "invalid eth address length" },
        { name: "Should revert (invalid hex chars)", input: "0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG", expectRevert: true, revertMsg: "invalid hex character" },
        { name: "Should revert (invalid hex chars 2)", input: "0x00000000000000000000000000000000000GGGGG", expectRevert: true, revertMsg: "invalid hex character" },
        // User said: "0x0000...0000 -> should revert (zero address)". 
        // Wait, the user asked if "0x0000000000000000000000000000000000000000" should revert. Actually the code itself does NOT check for address(0) inside `_parseEthAddress` directly, but the caller in `initiateBridge` does! Wait, if `initiateBridge` accepts `ethAddress`, it parses it inside `processBridge` where we pass `_parseEthAddress(bridge.ethAddress)`. Wait, inside `initiateBridge` it checks: `require(bytes(ethAddress).length == 42, " BridgeContract: invalid eth address ");` but it DOES NOT check for address(0) inside `initiateBridge` anymore. Let's see if we should test it.
        { name: "Should return zero address", input: "0x0000000000000000000000000000000000000000", expectRevert: true, revertMsg: "zero address" },
        { name: "Should return correct address", input: "0xE2e1B56aDF4dB8A32cb8e235e128C4BEEebFF96a", expectRevert: false, expectedValue: "0E2e1B56aDF4dB8A32cb8e235e128C4BEEebFF96a" }
    ];

    for (let t of tests) {
        console.log(`\nTest: ${t.name}`);
        console.log(`Input: ${t.input}`);
        try {
            const res = await testParser.testParseEthAddress(t.input);
            if (t.expectRevert) {
                console.error("❌ FAILED: Expected revert but it succeeded!");
            } else {
                console.log(`✅ SUCCEEDED: Got ${res}`);
                if (res.toLowerCase() !== t.input.toLowerCase()) {
                    console.error(`❌ FAILED: Expected ${t.input} but got ${res}`);
                }
            }
        } catch (error) {
            if (t.expectRevert) {
                if (error.message.includes(t.revertMsg)) {
                    console.log(`✅ SUCCEEDED (Reverted as expected): ${t.revertMsg}`);
                } else {
                    console.log(`⚠️ REVERTED, but maybe wrong reason: ${error.message}`);
                }
            } else {
                console.error(`❌ FAILED: Unexpected revert: ${error.message}`);
            }
        }
    }
}

main().catch(console.error);
