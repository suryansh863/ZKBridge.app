import { expect } from "chai";
import { ethers } from "hardhat";
import { BTCRelay, WrappedBTC, ProofVerifier, BridgeContract } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BridgeContract", function () {
  let btcRelay: BTCRelay;
  let wrappedBTC: WrappedBTC;
  let proofVerifier: ProofVerifier;
  let bridgeContract: BridgeContract;
  
  let admin: SignerWithAddress;
  let operator: SignerWithAddress;
  let relayer: SignerWithAddress;
  let user: SignerWithAddress;

  const GENESIS_HASH = "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
  const GENESIS_TIMESTAMP = 1231006505;
  const TOKEN_NAME = "Wrapped Bitcoin";
  const TOKEN_SYMBOL = "WBTC";

  beforeEach(async function () {
    [admin, operator, relayer, user] = await ethers.getSigners();

    // Deploy BTCRelay
    const BTCRelayFactory = await ethers.getContractFactory("BTCRelay");
    btcRelay = await BTCRelayFactory.deploy(GENESIS_HASH, GENESIS_TIMESTAMP);
    await btcRelay.waitForDeployment();

    // Deploy WrappedBTC
    const WrappedBTCFactory = await ethers.getContractFactory("WrappedBTC");
    wrappedBTC = await WrappedBTCFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL, admin.address);
    await wrappedBTC.waitForDeployment();

    // Deploy ProofVerifier
    const ProofVerifierFactory = await ethers.getContractFactory("ProofVerifier");
    proofVerifier = await ProofVerifierFactory.deploy();
    await proofVerifier.waitForDeployment();

    // Deploy BridgeContract
    const BridgeContractFactory = await ethers.getContractFactory("BridgeContract");
    bridgeContract = await BridgeContractFactory.deploy(
      await btcRelay.getAddress(),
      await wrappedBTC.getAddress(),
      await proofVerifier.getAddress()
    );
    await bridgeContract.waitForDeployment();

    // Set bridge contract in WrappedBTC
    await wrappedBTC.setBridgeContract(await bridgeContract.getAddress());

    // Grant roles
    await btcRelay.grantRole(await btcRelay.RELAYER_ROLE(), relayer.address);
    await btcRelay.grantRole(await btcRelay.OPERATOR_ROLE(), operator.address);
    
    await bridgeContract.grantRole(await bridgeContract.OPERATOR_ROLE(), operator.address);
    await bridgeContract.grantRole(await bridgeContract.RELAYER_ROLE(), relayer.address);
    
    await proofVerifier.grantRole(await proofVerifier.VERIFIER_ROLE(), relayer.address);
    await proofVerifier.grantRole(await proofVerifier.OPERATOR_ROLE(), operator.address);
  });

  describe("Deployment", function () {
    it("Should set correct contract addresses", async function () {
      expect(await bridgeContract.btcRelay()).to.equal(await btcRelay.getAddress());
      expect(await bridgeContract.wrappedBTC()).to.equal(await wrappedBTC.getAddress());
      expect(await bridgeContract.proofVerifier()).to.equal(await proofVerifier.getAddress());
    });

    it("Should set correct initial values", async function () {
      expect(await bridgeContract.bridgeFeeBasisPoints()).to.equal(30); // 0.3%
      expect(await bridgeContract.minBridgeAmount()).to.equal(1000);
      expect(await bridgeContract.maxBridgeAmount()).to.equal(ethers.parseUnits("1000000", 8));
    });

    it("Should grant admin role to deployer", async function () {
      expect(await bridgeContract.hasRole(await bridgeContract.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await bridgeContract.hasRole(await bridgeContract.ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await bridgeContract.hasRole(await bridgeContract.OPERATOR_ROLE(), admin.address)).to.be.true;
      expect(await bridgeContract.hasRole(await bridgeContract.RELAYER_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("Bridge Initiation", function () {
    const AMOUNT = ethers.parseUnits("1", 8); // 1 BTC
    const BTC_TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const BTC_ADDRESS = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    const ETH_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

    it("Should allow operator to initiate bridge", async function () {
      await expect(
        bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS)
      )
        .to.emit(bridgeContract, "BridgeInitiated")
        .withArgs(
          await bridgeContract.bridgeId(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS, 0, 0), // This would be the actual bridgeId
          operator.address,
          AMOUNT,
          BTC_TX_HASH,
          BTC_ADDRESS
        );

      const stats = await bridgeContract.getBridgeStats();
      expect(stats.totalBridges).to.equal(1);
      expect(stats.totalVolume).to.equal(AMOUNT);
      expect(stats.activeBridges).to.equal(1);
    });

    it("Should calculate correct fee", async function () {
      const bridgeId = await bridgeContract.connect(operator).callStatic.initiateBridge(
        AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS
      );
      
      const bridge = await bridgeContract.getBridge(bridgeId);
      const expectedFee = AMOUNT * 30n / 10000n; // 0.3% fee
      expect(bridge.fee).to.equal(expectedFee);
      expect(bridge.amount).to.equal(AMOUNT - expectedFee);
    });

    it("Should reject amount below minimum", async function () {
      const smallAmount = 500; // Below minBridgeAmount
      await expect(
        bridgeContract.connect(operator).initiateBridge(smallAmount, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS)
      ).to.be.revertedWith("BridgeContract: amount below minimum");
    });

    it("Should reject amount above maximum", async function () {
      const largeAmount = ethers.parseUnits("2000000", 8); // Above maxBridgeAmount
      await expect(
        bridgeContract.connect(operator).initiateBridge(largeAmount, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS)
      ).to.be.revertedWith("BridgeContract: amount above maximum");
    });

    it("Should reject invalid Bitcoin transaction hash", async function () {
      await expect(
        bridgeContract.connect(operator).initiateBridge(AMOUNT, ethers.ZeroHash, BTC_ADDRESS, ETH_ADDRESS)
      ).to.be.revertedWith("BridgeContract: invalid Bitcoin transaction hash");
    });

    it("Should reject empty Bitcoin address", async function () {
      await expect(
        bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, "", ETH_ADDRESS)
      ).to.be.revertedWith("BridgeContract: invalid Bitcoin address");
    });

    it("Should reject empty Ethereum address", async function () {
      await expect(
        bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, "")
      ).to.be.revertedWith("BridgeContract: invalid Ethereum address");
    });

    it("Should reject duplicate transaction", async function () {
      await bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS);
      
      await expect(
        bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS)
      ).to.be.revertedWith("BridgeContract: transaction already processed");
    });

    it("Should reject non-operator from initiating bridge", async function () {
      await expect(
        bridgeContract.connect(user).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS)
      ).to.be.revertedWith("BridgeContract: caller is not an operator");
    });
  });

  describe("Bridge Processing", function () {
    const AMOUNT = ethers.parseUnits("1", 8);
    const BTC_TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const BTC_ADDRESS = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    const ETH_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
    const MERKLE_PROOF = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const ZK_PROOF = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    let bridgeId: string;

    beforeEach(async function () {
      // Add block header to BTCRelay
      await btcRelay.connect(relayer).addBlockHeader(
        "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
        GENESIS_HASH,
        GENESIS_TIMESTAMP + 600,
        0x1d00ffff
      );

      // Verify transaction in BTCRelay (simulate)
      // Note: In a real test, you would need to properly verify the transaction
      
      // Submit and verify ZK proof
      const circuitId = ethers.keccak256(ethers.toUtf8Bytes("bitcoin_tx_verify"));
      const proof = "0x" + "a".repeat(512);
      const publicInputs = [1, 2, 3, 4, 5];
      
      await proofVerifier.connect(operator).submitProof(circuitId, proof, publicInputs, BTC_TX_HASH);
      
      const proofHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes", "uint256[]", "bytes32", "uint256"],
        [circuitId, proof, publicInputs, BTC_TX_HASH, await ethers.provider.getBlockNumber()]
      ));
      
      await proofVerifier.connect(relayer).verifyProof(proofHash);

      // Initiate bridge
      bridgeId = await bridgeContract.connect(operator).callStatic.initiateBridge(
        AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS
      );
      await bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS);
    });

    it("Should allow relayer to process bridge", async function () {
      await expect(
        bridgeContract.connect(relayer).processBridge(bridgeId, MERKLE_PROOF, ZK_PROOF)
      )
        .to.emit(bridgeContract, "BridgeCompleted");

      const bridge = await bridgeContract.getBridge(bridgeId);
      expect(bridge.status).to.equal(2); // BridgeStatus.Completed
      expect(bridge.processedAt).to.be.greaterThan(0);
      expect(bridge.verified).to.be.true;

      const stats = await bridgeContract.getBridgeStats();
      expect(stats.activeBridges).to.equal(0);
      expect(stats.completedBridges).to.equal(1);
    });

    it("Should reject processing non-existent bridge", async function () {
      const nonExistentBridgeId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      
      await expect(
        bridgeContract.connect(relayer).processBridge(nonExistentBridgeId, MERKLE_PROOF, ZK_PROOF)
      ).to.be.revertedWith("BridgeContract: bridge does not exist");
    });

    it("Should reject processing bridge with invalid status", async function () {
      // Process the bridge first
      await bridgeContract.connect(relayer).processBridge(bridgeId, MERKLE_PROOF, ZK_PROOF);
      
      // Try to process again
      await expect(
        bridgeContract.connect(relayer).processBridge(bridgeId, MERKLE_PROOF, ZK_PROOF)
      ).to.be.revertedWith("BridgeContract: invalid bridge status");
    });

    it("Should reject processing without Bitcoin verification", async function () {
      // Create a new bridge without Bitcoin verification
      const newTxHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      const newBridgeId = await bridgeContract.connect(operator).callStatic.initiateBridge(
        AMOUNT, newTxHash, BTC_ADDRESS, ETH_ADDRESS
      );
      await bridgeContract.connect(operator).initiateBridge(AMOUNT, newTxHash, BTC_ADDRESS, ETH_ADDRESS);

      await expect(
        bridgeContract.connect(relayer).processBridge(newBridgeId, MERKLE_PROOF, ZK_PROOF)
      ).to.be.revertedWith("BridgeContract: Bitcoin transaction not verified");
    });

    it("Should reject processing with invalid ZK proof", async function () {
      const invalidZkProof = ethers.keccak256(ethers.toUtf8Bytes("invalid"));
      
      await expect(
        bridgeContract.connect(relayer).processBridge(bridgeId, MERKLE_PROOF, invalidZkProof)
      ).to.be.revertedWith("BridgeContract: invalid ZK proof");
    });

    it("Should reject non-relayer from processing bridge", async function () {
      await expect(
        bridgeContract.connect(user).processBridge(bridgeId, MERKLE_PROOF, ZK_PROOF)
      ).to.be.revertedWith("BridgeContract: caller is not a relayer");
    });
  });

  describe("Bridge Claiming", function () {
    const AMOUNT = ethers.parseUnits("1", 8);
    const BTC_TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const BTC_ADDRESS = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    const ETH_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
    const CLAIM_ADDRESS = "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2";

    let bridgeId: string;

    beforeEach(async function () {
      // Set up and complete a bridge
      bridgeId = await bridgeContract.connect(operator).callStatic.initiateBridge(
        AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS
      );
      await bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS);
      
      // Process the bridge (simplified for testing)
      await bridgeContract.connect(relayer).processBridge(
        bridgeId,
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );
    });

    it("Should allow operator to claim Bitcoin", async function () {
      await expect(
        bridgeContract.connect(operator).claimBitcoin(bridgeId, CLAIM_ADDRESS)
      )
        .to.emit(bridgeContract, "BridgeClaimed");

      const bridge = await bridgeContract.getBridge(bridgeId);
      expect(bridge.status).to.equal(3); // BridgeStatus.Claimed
      expect(bridge.claimedAt).to.be.greaterThan(0);
    });

    it("Should reject claiming non-completed bridge", async function () {
      // Create a new pending bridge
      const newTxHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      const newBridgeId = await bridgeContract.connect(operator).callStatic.initiateBridge(
        AMOUNT, newTxHash, BTC_ADDRESS, ETH_ADDRESS
      );
      await bridgeContract.connect(operator).initiateBridge(AMOUNT, newTxHash, BTC_ADDRESS, ETH_ADDRESS);

      await expect(
        bridgeContract.connect(operator).claimBitcoin(newBridgeId, CLAIM_ADDRESS)
      ).to.be.revertedWith("BridgeContract: bridge not completed");
    });

    it("Should reject claiming already claimed bridge", async function () {
      await bridgeContract.connect(operator).claimBitcoin(bridgeId, CLAIM_ADDRESS);
      
      await expect(
        bridgeContract.connect(operator).claimBitcoin(bridgeId, CLAIM_ADDRESS)
      ).to.be.revertedWith("BridgeContract: already claimed");
    });

    it("Should reject claiming with empty Bitcoin address", async function () {
      await expect(
        bridgeContract.connect(operator).claimBitcoin(bridgeId, "")
      ).to.be.revertedWith("BridgeContract: invalid Bitcoin address");
    });

    it("Should reject non-operator from claiming", async function () {
      await expect(
        bridgeContract.connect(user).claimBitcoin(bridgeId, CLAIM_ADDRESS)
      ).to.be.revertedWith("BridgeContract: caller is not an operator");
    });
  });

  describe("Bridge Cancellation", function () {
    const AMOUNT = ethers.parseUnits("1", 8);
    const BTC_TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const BTC_ADDRESS = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    const ETH_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

    let bridgeId: string;

    beforeEach(async function () {
      bridgeId = await bridgeContract.connect(operator).callStatic.initiateBridge(
        AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS
      );
      await bridgeContract.connect(operator).initiateBridge(AMOUNT, BTC_TX_HASH, BTC_ADDRESS, ETH_ADDRESS);
    });

    it("Should allow admin to cancel bridge", async function () {
      const reason = "Invalid transaction";
      
      await expect(
        bridgeContract.connect(admin).cancelBridge(bridgeId, reason)
      )
        .to.emit(bridgeContract, "BridgeCancelled");

      const bridge = await bridgeContract.getBridge(bridgeId);
      expect(bridge.status).to.equal(4); // BridgeStatus.Cancelled

      const stats = await bridgeContract.getBridgeStats();
      expect(stats.activeBridges).to.equal(0);
      expect(stats.failedBridges).to.equal(1);
    });

    it("Should reject cancelling non-existent bridge", async function () {
      const nonExistentBridgeId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      
      await expect(
        bridgeContract.connect(admin).cancelBridge(nonExistentBridgeId, "reason")
      ).to.be.revertedWith("BridgeContract: bridge does not exist");
    });

    it("Should reject cancelling already completed bridge", async function () {
      // Complete the bridge first
      await bridgeContract.connect(relayer).processBridge(
        bridgeId,
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );

      await expect(
        bridgeContract.connect(admin).cancelBridge(bridgeId, "reason")
      ).to.be.revertedWith("BridgeContract: cannot cancel bridge");
    });

    it("Should reject non-admin from cancelling bridge", async function () {
      await expect(
        bridgeContract.connect(user).cancelBridge(bridgeId, "reason")
      ).to.be.revertedWith("AccessControl: account " + user.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Configuration Management", function () {
    it("Should allow admin to update bridge fee", async function () {
      const newFee = 50; // 0.5%
      
      await expect(
        bridgeContract.connect(admin).updateBridgeFee(newFee)
      )
        .to.emit(bridgeContract, "FeeUpdated")
        .withArgs(30, newFee, admin.address, await ethers.provider.getBlockNumber());

      expect(await bridgeContract.bridgeFeeBasisPoints()).to.equal(newFee);
    });

    it("Should reject fee above maximum", async function () {
      const highFee = 1500; // 15%, above MAX_FEE_BASIS_POINTS
      
      await expect(
        bridgeContract.connect(admin).updateBridgeFee(highFee)
      ).to.be.revertedWith("BridgeContract: fee too high");
    });

    it("Should allow admin to update bridge limits", async function () {
      const newMinAmount = 2000;
      const newMaxAmount = ethers.parseUnits("2000000", 8);
      
      await expect(
        bridgeContract.connect(admin).updateBridgeLimits(newMinAmount, newMaxAmount)
      )
        .to.emit(bridgeContract, "LimitsUpdated");

      expect(await bridgeContract.minBridgeAmount()).to.equal(newMinAmount);
      expect(await bridgeContract.maxBridgeAmount()).to.equal(newMaxAmount);
    });

    it("Should reject invalid limits", async function () {
      await expect(
        bridgeContract.connect(admin).updateBridgeLimits(0, 1000)
      ).to.be.revertedWith("BridgeContract: invalid minimum amount");

      await expect(
        bridgeContract.connect(admin).updateBridgeLimits(2000, 1000)
      ).to.be.revertedWith("BridgeContract: invalid maximum amount");
    });

    it("Should reject non-admin from updating configuration", async function () {
      await expect(
        bridgeContract.connect(user).updateBridgeFee(50)
      ).to.be.revertedWith("AccessControl: account " + user.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to pause in emergency", async function () {
      await bridgeContract.connect(admin).emergencyPause();
      expect(await bridgeContract.emergencyMode()).to.be.true;
      expect(await bridgeContract.paused()).to.be.true;
    });

    it("Should allow admin to resume after emergency", async function () {
      await bridgeContract.connect(admin).emergencyPause();
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      await bridgeContract.connect(admin).resume();
      expect(await bridgeContract.emergencyMode()).to.be.false;
      expect(await bridgeContract.paused()).to.be.false;
    });

    it("Should reject resume before emergency check interval", async function () {
      await bridgeContract.connect(admin).emergencyPause();
      
      await expect(
        bridgeContract.connect(admin).resume()
      ).to.be.revertedWith("BridgeContract: emergency check interval not met");
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add operator", async function () {
      await bridgeContract.connect(admin).addOperator(user.address);
      expect(await bridgeContract.hasRole(await bridgeContract.OPERATOR_ROLE(), user.address)).to.be.true;
    });

    it("Should allow admin to remove operator", async function () {
      await bridgeContract.connect(admin).removeOperator(operator.address);
      expect(await bridgeContract.hasRole(await bridgeContract.OPERATOR_ROLE(), operator.address)).to.be.false;
    });

    it("Should allow admin to add relayer", async function () {
      await bridgeContract.connect(admin).addRelayer(user.address);
      expect(await bridgeContract.hasRole(await bridgeContract.RELAYER_ROLE(), user.address)).to.be.true;
    });

    it("Should allow admin to remove relayer", async function () {
      await bridgeContract.connect(admin).removeRelayer(relayer.address);
      expect(await bridgeContract.hasRole(await bridgeContract.RELAYER_ROLE(), relayer.address)).to.be.false;
    });

    it("Should reject non-admin from managing roles", async function () {
      await expect(
        bridgeContract.connect(user).addOperator(user.address)
      ).to.be.revertedWith("AccessControl: account " + user.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });
});
