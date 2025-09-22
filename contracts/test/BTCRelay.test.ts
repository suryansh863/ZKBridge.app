import { expect } from "chai";
import { ethers } from "hardhat";
import { BTCRelay } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BTCRelay", function () {
  let btcRelay: BTCRelay;
  let admin: SignerWithAddress;
  let relayer: SignerWithAddress;
  let operator: SignerWithAddress;
  let user: SignerWithAddress;

  const GENESIS_HASH = "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
  const GENESIS_TIMESTAMP = 1231006505;

  beforeEach(async function () {
    [admin, relayer, operator, user] = await ethers.getSigners();

    const BTCRelayFactory = await ethers.getContractFactory("BTCRelay");
    btcRelay = await BTCRelayFactory.deploy(GENESIS_HASH, GENESIS_TIMESTAMP);
    await btcRelay.waitForDeployment();

    // Grant roles
    await btcRelay.grantRole(await btcRelay.RELAYER_ROLE(), relayer.address);
    await btcRelay.grantRole(await btcRelay.OPERATOR_ROLE(), operator.address);
  });

  describe("Deployment", function () {
    it("Should set the correct genesis hash and timestamp", async function () {
      expect(await btcRelay.genesisHash()).to.equal(GENESIS_HASH);
      expect(await btcRelay.genesisTimestamp()).to.equal(GENESIS_TIMESTAMP);
      expect(await btcRelay.currentHeight()).to.equal(0);
    });

    it("Should initialize genesis block", async function () {
      const genesisBlock = await btcRelay.blockHeaders(0);
      expect(genesisBlock.hash).to.equal(GENESIS_HASH);
      expect(genesisBlock.prevHash).to.equal(ethers.ZeroHash);
      expect(genesisBlock.timestamp).to.equal(GENESIS_TIMESTAMP);
      expect(genesisBlock.height).to.equal(0);
      expect(genesisBlock.exists).to.be.true;
    });

    it("Should grant admin role to deployer", async function () {
      expect(await btcRelay.hasRole(await btcRelay.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await btcRelay.hasRole(await btcRelay.ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await btcRelay.hasRole(await btcRelay.OPERATOR_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("Block Header Management", function () {
    const BLOCK_HASH = "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
    const PREV_HASH = GENESIS_HASH;
    const TIMESTAMP = GENESIS_TIMESTAMP + 600; // 10 minutes later
    const DIFFICULTY = 0x1d00ffff;

    it("Should allow relayer to add block header", async function () {
      await expect(btcRelay.connect(relayer).addBlockHeader(BLOCK_HASH, PREV_HASH, TIMESTAMP, DIFFICULTY))
        .to.emit(btcRelay, "BlockHeaderAdded")
        .withArgs(1, BLOCK_HASH, TIMESTAMP, DIFFICULTY);

      expect(await btcRelay.currentHeight()).to.equal(1);
      
      const blockHeader = await btcRelay.blockHeaders(1);
      expect(blockHeader.hash).to.equal(BLOCK_HASH);
      expect(blockHeader.prevHash).to.equal(PREV_HASH);
      expect(blockHeader.timestamp).to.equal(TIMESTAMP);
      expect(blockHeader.difficulty).to.equal(DIFFICULTY);
      expect(blockHeader.height).to.equal(1);
      expect(blockHeader.exists).to.be.true;
    });

    it("Should reject invalid block hash", async function () {
      await expect(
        btcRelay.connect(relayer).addBlockHeader(ethers.ZeroHash, PREV_HASH, TIMESTAMP, DIFFICULTY)
      ).to.be.revertedWith("BTCRelay: invalid block hash");
    });

    it("Should reject invalid previous hash", async function () {
      await expect(
        btcRelay.connect(relayer).addBlockHeader(BLOCK_HASH, ethers.ZeroHash, TIMESTAMP, DIFFICULTY)
      ).to.be.revertedWith("BTCRelay: invalid previous hash");
    });

    it("Should reject future timestamp", async function () {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 7200; // 2 hours in future
      await expect(
        btcRelay.connect(relayer).addBlockHeader(BLOCK_HASH, PREV_HASH, futureTimestamp, DIFFICULTY)
      ).to.be.revertedWith("BTCRelay: block timestamp too far in future");
    });

    it("Should reject non-relayer from adding block headers", async function () {
      await expect(
        btcRelay.connect(user).addBlockHeader(BLOCK_HASH, PREV_HASH, TIMESTAMP, DIFFICULTY)
      ).to.be.revertedWith("BTCRelay: caller is not a relayer");
    });
  });

  describe("Merkle Proof Verification", function () {
    const TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const BLOCK_HASH = "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
    const HEIGHT = 0;
    const INDEX = 0;
    const SIBLINGS = ["0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"];

    beforeEach(async function () {
      // Add a block header first
      await btcRelay.connect(relayer).addBlockHeader(
        BLOCK_HASH,
        GENESIS_HASH,
        GENESIS_TIMESTAMP + 600,
        0x1d00ffff
      );
    });

    it("Should verify Merkle proof", async function () {
      const merkleProof = {
        txHash: TX_HASH,
        blockHash: BLOCK_HASH,
        height: HEIGHT,
        index: INDEX,
        siblings: SIBLINGS
      };

      const isValid = await btcRelay.connect(operator).verifyMerkleProof(merkleProof);
      expect(isValid).to.be.true;
    });

    it("Should record verified transaction", async function () {
      const merkleProof = {
        txHash: TX_HASH,
        blockHash: BLOCK_HASH,
        height: HEIGHT,
        index: INDEX,
        siblings: SIBLINGS
      };

      await expect(btcRelay.connect(operator).verifyAndRecordTransaction(merkleProof))
        .to.emit(btcRelay, "MerkleProofVerified")
        .withArgs(TX_HASH, BLOCK_HASH, HEIGHT, INDEX);

      expect(await btcRelay.isTransactionVerified(TX_HASH)).to.be.true;
    });

    it("Should reject duplicate transaction verification", async function () {
      const merkleProof = {
        txHash: TX_HASH,
        blockHash: BLOCK_HASH,
        height: HEIGHT,
        index: INDEX,
        siblings: SIBLINGS
      };

      await btcRelay.connect(operator).verifyAndRecordTransaction(merkleProof);

      await expect(
        btcRelay.connect(operator).verifyAndRecordTransaction(merkleProof)
      ).to.be.revertedWith("BTCRelay: transaction already verified");
    });

    it("Should reject insufficient confirmations", async function () {
      const merkleProof = {
        txHash: TX_HASH,
        blockHash: BLOCK_HASH,
        height: HEIGHT,
        index: INDEX,
        siblings: SIBLINGS
      };

      await expect(
        btcRelay.connect(operator).verifyAndRecordTransaction(merkleProof)
      ).to.be.revertedWith("BTCRelay: insufficient confirmations");
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to add relayer", async function () {
      await expect(btcRelay.connect(admin).addRelayer(user.address))
        .to.not.be.reverted;

      expect(await btcRelay.hasRole(await btcRelay.RELAYER_ROLE(), user.address)).to.be.true;
    });

    it("Should allow admin to remove relayer", async function () {
      await btcRelay.connect(admin).removeRelayer(relayer.address);
      expect(await btcRelay.hasRole(await btcRelay.RELAYER_ROLE(), relayer.address)).to.be.false;
    });

    it("Should reject non-admin from managing relayers", async function () {
      await expect(
        btcRelay.connect(user).addRelayer(user.address)
      ).to.be.revertedWith("AccessControl: account " + user.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to pause in emergency", async function () {
      await btcRelay.connect(admin).emergencyPause();
      expect(await btcRelay.emergencyMode()).to.be.true;
      expect(await btcRelay.paused()).to.be.true;
    });

    it("Should allow admin to resume after emergency", async function () {
      await btcRelay.connect(admin).emergencyPause();
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      await btcRelay.connect(admin).resume();
      expect(await btcRelay.emergencyMode()).to.be.false;
      expect(await btcRelay.paused()).to.be.false;
    });

    it("Should reject resume before emergency check interval", async function () {
      await btcRelay.connect(admin).emergencyPause();
      
      await expect(
        btcRelay.connect(admin).resume()
      ).to.be.revertedWith("BTCRelay: emergency check interval not met");
    });
  });
});
