const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  
  describe("HeritageWithWrongData", function () {
    let heritage;
    let token;
    let signer, acc2, acc3, acc4;
    const secondsInADay = 86400
    const amount = ethers.utils.parseEther('1000');
    //after one year
    let timeWhenWithdraw = (new Date()).getTime() + secondsInADay * 365;
    timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000);
  
    this.beforeEach(async () => {
      [signer, acc2, acc3, acc4] = await ethers.getSigners()
          const Heritage = await ethers.getContractFactory("Heritage");
      const TokenForTests = await ethers.getContractFactory("TokenForTests")
      heritage = await Heritage.deploy()
      token = await TokenForTests.deploy('TokenForTests', 'TFT')
      await heritage.deployed()
      await token.deployed()
    })
  
  
  });
  