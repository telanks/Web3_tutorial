const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { devlopmentChains } = require("../../helper-hardhat-config");

!devlopmentChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function () {
      let fundMe;
      let fundMeSecondAccount;
      let firstAccount;
      let secondAccount;
      let mockV3Aggregator;
      this.beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        const fundMeDeployment = await deployments.get("FundMe");
        mockV3Aggregator = await deployments.get("MockV3Aggregator");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount);
      });

      it("test if the owner is msg.sender", async function () {
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.owner(), firstAccount);
      });

      it("test if the dataFeed is assigned correctly", async function () {
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.dataFeed(), mockV3Aggregator.address);
      });

      it("window closed,value greater than minmun, fund failed", async function () {
        // make sure window is closed
        await helpers.time.increase(200);
        await helpers.mine();
        //value is greater minimun value
        expect(
          fundMe.fund({ value: ethers.parseEther("0.1") })
        ).to.be.revertedWith("window is closed"); //wei
      });

      it("window open, value is less than minimun, fund failed", async function () {
        expect(
          fundMe.fund({ value: ethers.parseEther("0.1") })
        ).to.be.revertedWith("Send more ETH"); //wei
      });

      it("window open, value is greater minimun, fund success", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        const balance = await fundMe.fundersToAmount(firstAccount);
        expect(balance).to.equal(ethers.parseEther("0.1"));
      });

      //unit test for getFund
      //onlyOwner, windowClosed, target reached
      it("not owner ,window closed,target reached,getFund failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        // make sure window is closed
        await helpers.time.increase(200);
        await helpers.mine();
        expect(await fundMeSecondAccount.getFund()).to.be.revertedWith(
          "this function can only be called by owner"
        );
      });

      it("window open,target reached,getFund failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await expect(fundMe.getFund()).to.be.revertedWith(
          "window is not closed"
        );
      });

      it("window closed, target not reached", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        // make sure window is closed
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.getFund()).to.be.revertedWith(
          "Target is not reached"
        );
      });

      it("window closed, target reached, getFund success", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.getFund())
          .to.emit(fundMe, "FundWithdrawByOwner")
          .withArgs(ethers.parseEther("1.2"));
      });

      it("window open, target not reached, funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await expect(fundMe.refund()).to.be.revertedWith(
          "window is not closed"
        );
      });

      it("window open, target reached, funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.refund()).to.be.revertedWith("Target is reached");
      });

      it("window open, target not reached, funder does not has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await helpers.time.increase(200);
        await helpers.mine();
        expect(await fundMeSecondAccount.refund()).to.be.revertedWith(
          "there is no fund for you"
        );
      });

      it("window closed, target not reached, funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.refund())
          .to.emit(fundMe, "RefundByFunder")
          .withArgs(firstAccount, ethers.parseEther("0.1"));
      });
    });
