import { expect } from "chai";
import { ethers } from "hardhat";
import { WrappedBTC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("WrappedBTC", function () {
  let wrappedBTC: WrappedBTC;
  let admin: SignerWithAddress;
  let bridge: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let user: SignerWithAddress;

  const TOKEN_NAME = "Wrapped Bitcoin";
  const TOKEN_SYMBOL = "WBTC";
  const INITIAL_SUPPLY = 0;

  beforeEach(async function () {
    [admin, bridge, minter, burner, user] = await ethers.getSigners();

    const WrappedBTCFactory = await ethers.getContractFactory("WrappedBTC");
    wrappedBTC = await WrappedBTCFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL, admin.address);
    await wrappedBTC.waitForDeployment();

    // Set bridge contract
    await wrappedBTC.setBridgeContract(bridge.address);

    // Grant roles
    await wrappedBTC.grantRole(await wrappedBTC.MINTER_ROLE(), minter.address);
    await wrappedBTC.grantRole(await wrappedBTC.BURNER_ROLE(), burner.address);
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await wrappedBTC.name()).to.equal(TOKEN_NAME);
      expect(await wrappedBTC.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await wrappedBTC.decimals()).to.equal(18); // ERC20 default decimals
    });

    it("Should set initial supply correctly", async function () {
      expect(await wrappedBTC.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should grant admin role to deployer", async function () {
      expect(await wrappedBTC.hasRole(await wrappedBTC.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await wrappedBTC.hasRole(await wrappedBTC.ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("Should set bridge contract", async function () {
      expect(await wrappedBTC.bridgeContract()).to.equal(bridge.address);
    });
  });

  describe("Minting", function () {
    const AMOUNT = ethers.parseUnits("1", 8); // 1 BTC in satoshis
    const BTC_TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const BTC_ADDRESS = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";

    it("Should allow bridge to mint tokens", async function () {
      await expect(
        wrappedBTC.connect(bridge).mint(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      )
        .to.emit(wrappedBTC, "BitcoinLocked")
        .withArgs(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS);

      expect(await wrappedBTC.balanceOf(user.address)).to.equal(AMOUNT);
      expect(await wrappedBTC.totalSupply()).to.equal(AMOUNT);
      expect(await wrappedBTC.getTotalLockedBitcoin()).to.equal(AMOUNT);
      expect(await wrappedBTC.getTotalMintedTokens()).to.equal(AMOUNT);
    });

    it("Should reject minting below minimum amount", async function () {
      const smallAmount = 50; // Below MIN_MINT_AMOUNT (100)
      await expect(
        wrappedBTC.connect(bridge).mint(user.address, smallAmount, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: amount below minimum");
    });

    it("Should reject minting above maximum amount", async function () {
      const largeAmount = ethers.parseUnits("2000000", 8); // Above MAX_MINT_AMOUNT
      await expect(
        wrappedBTC.connect(bridge).mint(user.address, largeAmount, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: amount above maximum");
    });

    it("Should reject minting to zero address", async function () {
      await expect(
        wrappedBTC.connect(bridge).mint(ethers.ZeroAddress, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: mint to zero address");
    });

    it("Should reject minting when paused", async function () {
      await wrappedBTC.connect(admin).pause();
      await expect(
        wrappedBTC.connect(bridge).mint(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should reject minting when in emergency mode", async function () {
      await wrappedBTC.connect(admin).emergencyPause();
      await expect(
        wrappedBTC.connect(bridge).mint(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: emergency mode active");
    });

    it("Should reject non-bridge from minting", async function () {
      await expect(
        wrappedBTC.connect(user).mint(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: caller is not the bridge contract");
    });
  });

  describe("Burning", function () {
    const AMOUNT = ethers.parseUnits("1", 8); // 1 BTC in satoshis
    const BTC_TX_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const BTC_ADDRESS = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";

    beforeEach(async function () {
      // Mint tokens first
      await wrappedBTC.connect(bridge).mint(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS);
    });

    it("Should allow bridge to burn tokens", async function () {
      await expect(
        wrappedBTC.connect(bridge).burn(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      )
        .to.emit(wrappedBTC, "BitcoinUnlocked")
        .withArgs(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS);

      expect(await wrappedBTC.balanceOf(user.address)).to.equal(0);
      expect(await wrappedBTC.totalSupply()).to.equal(0);
      expect(await wrappedBTC.getTotalLockedBitcoin()).to.equal(0);
      expect(await wrappedBTC.getTotalMintedTokens()).to.equal(0);
    });

    it("Should reject burning more than balance", async function () {
      const largeAmount = ethers.parseUnits("2", 8);
      await expect(
        wrappedBTC.connect(bridge).burn(user.address, largeAmount, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: insufficient balance");
    });

    it("Should reject burning from zero address", async function () {
      await expect(
        wrappedBTC.connect(bridge).burn(ethers.ZeroAddress, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: burn from zero address");
    });

    it("Should reject burning when paused", async function () {
      await wrappedBTC.connect(admin).pause();
      await expect(
        wrappedBTC.connect(bridge).burn(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should reject non-bridge from burning", async function () {
      await expect(
        wrappedBTC.connect(user).burn(user.address, AMOUNT, BTC_TX_HASH, BTC_ADDRESS)
      ).to.be.revertedWith("WrappedBTC: caller is not the bridge contract");
    });
  });

  describe("Emergency Functions", function () {
    const AMOUNT = ethers.parseUnits("1", 8);

    it("Should allow emergency mint in emergency mode", async function () {
      await wrappedBTC.connect(admin).emergencyPause();
      
      await wrappedBTC.connect(admin).emergencyMint(user.address, AMOUNT);
      expect(await wrappedBTC.balanceOf(user.address)).to.equal(AMOUNT);
      expect(await wrappedBTC.getTotalMintedTokens()).to.equal(AMOUNT);
    });

    it("Should allow emergency burn in emergency mode", async function () {
      await wrappedBTC.connect(admin).emergencyPause();
      
      // First mint some tokens
      await wrappedBTC.connect(admin).emergencyMint(user.address, AMOUNT);
      
      // Then burn them
      await wrappedBTC.connect(admin).emergencyBurn(user.address, AMOUNT);
      expect(await wrappedBTC.balanceOf(user.address)).to.equal(0);
      expect(await wrappedBTC.getTotalMintedTokens()).to.equal(0);
    });

    it("Should reject emergency functions when not in emergency mode", async function () {
      await expect(
        wrappedBTC.connect(admin).emergencyMint(user.address, AMOUNT)
      ).to.be.revertedWith("WrappedBTC: not in emergency mode");
    });

    it("Should allow emergency pause and resume", async function () {
      await wrappedBTC.connect(admin).emergencyPause();
      expect(await wrappedBTC.emergencyMode()).to.be.true;
      expect(await wrappedBTC.paused()).to.be.true;

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine", []);

      await wrappedBTC.connect(admin).resume();
      expect(await wrappedBTC.emergencyMode()).to.be.false;
      expect(await wrappedBTC.paused()).to.be.false;
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add minter", async function () {
      await wrappedBTC.connect(admin).addMinter(user.address);
      expect(await wrappedBTC.hasRole(await wrappedBTC.MINTER_ROLE(), user.address)).to.be.true;
    });

    it("Should allow admin to remove minter", async function () {
      await wrappedBTC.connect(admin).removeMinter(minter.address);
      expect(await wrappedBTC.hasRole(await wrappedBTC.MINTER_ROLE(), minter.address)).to.be.false;
    });

    it("Should allow admin to add burner", async function () {
      await wrappedBTC.connect(admin).addBurner(user.address);
      expect(await wrappedBTC.hasRole(await wrappedBTC.BURNER_ROLE(), user.address)).to.be.true;
    });

    it("Should allow admin to remove burner", async function () {
      await wrappedBTC.connect(admin).removeBurner(burner.address);
      expect(await wrappedBTC.hasRole(await wrappedBTC.BURNER_ROLE(), burner.address)).to.be.false;
    });

    it("Should reject non-admin from managing roles", async function () {
      await expect(
        wrappedBTC.connect(user).addMinter(user.address)
      ).to.be.revertedWith("AccessControl: account " + user.address.toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Standard ERC20 Functions", function () {
    const AMOUNT = ethers.parseUnits("1", 8);

    beforeEach(async function () {
      await wrappedBTC.connect(bridge).mint(user.address, AMOUNT, 
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
      );
    });

    it("Should allow transfer", async function () {
      const transferAmount = ethers.parseUnits("0.5", 8);
      await wrappedBTC.connect(user).transfer(admin.address, transferAmount);
      
      expect(await wrappedBTC.balanceOf(user.address)).to.equal(ethers.parseUnits("0.5", 8));
      expect(await wrappedBTC.balanceOf(admin.address)).to.equal(transferAmount);
    });

    it("Should allow approval and transferFrom", async function () {
      const transferAmount = ethers.parseUnits("0.5", 8);
      
      await wrappedBTC.connect(user).approve(admin.address, transferAmount);
      expect(await wrappedBTC.allowance(user.address, admin.address)).to.equal(transferAmount);
      
      await wrappedBTC.connect(admin).transferFrom(user.address, bridge.address, transferAmount);
      expect(await wrappedBTC.balanceOf(bridge.address)).to.equal(transferAmount);
      expect(await wrappedBTC.allowance(user.address, admin.address)).to.equal(0);
    });

    it("Should allow burning by user", async function () {
      const burnAmount = ethers.parseUnits("0.5", 8);
      
      await wrappedBTC.connect(user).burn(burnAmount);
      expect(await wrappedBTC.balanceOf(user.address)).to.equal(ethers.parseUnits("0.5", 8));
      expect(await wrappedBTC.totalSupply()).to.equal(ethers.parseUnits("0.5", 8));
    });
  });
});
