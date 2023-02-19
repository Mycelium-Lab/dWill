const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  
  describe("TheWillUpdate", function () {
    let heritage;
    let token;
    let heir;
    let signer, acc2, acc3, acc4;
    const secondsInADay = 86400
    const toTest = 100;
    let tokenAmountPerOne = 1;
    const ID = 0
    const amount = ethers.utils.parseEther(`${tokenAmountPerOne * toTest}`);
    //after one year
    let timeNow = Math.round((new Date()).getTime() / 1000) ;
    let withdrawalTime = timeNow + secondsInADay * 365 * 5 + secondsInADay * 2;
    let timeInterval = withdrawalTime - timeNow

    this.beforeEach(async () => {
        [signer, acc2, acc3, acc4, acc5, acc6] = await ethers.getSigners()
        const Heritage = await ethers.getContractFactory("dWill");
        const TokenForTests = await ethers.getContractFactory("TokenForTests")
        heritage = await Heritage.deploy('0x0000000000000000000000000000000000000001', 0)
        token = await TokenForTests.deploy('TokenForTests', 'TFT')
        await heritage.deployed()
        await token.deployed()
    })

    it('should create will and update all', async () => {
        //create allowance to contract
        await token.increaseAllowance(heritage.address, amount)
        heir = acc2
        await heritage.addWill(heir.address, token.address, withdrawalTime, ethers.utils.parseEther(tokenAmountPerOne.toString()));
        //new heir
        heir = acc3
        //new time
        withdrawalTime = withdrawalTime + 1000
        //new amount
        tokenAmountPerOne = tokenAmountPerOne + 1
        await heritage.update(
            ID,                  //ID
            withdrawalTime,   //newTime
            heir.address,       //_heir
            ethers.utils.parseEther(tokenAmountPerOne.toString()),  //amount
        )
        
        const _updatedHeritage = await heritage.willData(ID)
        assert(_updatedHeritage.heir == heir.address, 'Heir updated')
        assert(_updatedHeritage.withdrawalTime.toString() == withdrawalTime.toString(), 'Time updated')
        assert(_updatedHeritage.amount.toString() == ethers.utils.parseEther(tokenAmountPerOne.toString()).toString(), 'Amount updated')
    })

    it('should update amount to unlimited', async () => {
        //create allowance to contract
        await token.increaseAllowance(heritage.address, ethers.constants.MaxUint256)
        heir = acc2
        await heritage.addWill(heir.address, token.address, withdrawalTime, ethers.utils.parseEther(tokenAmountPerOne.toString()));
        //new amount
        await heritage.update(
            ID,                  //ID
            withdrawalTime,   //newTime
            heir.address,       //_heir
            ethers.constants.MaxUint256,  //amount
        )
        const _updatedHeritage = await heritage.willData(ID)
        assert(_updatedHeritage.amount.toString() === ethers.constants.MaxUint256.toString(), 'Amount updated')
        await expect(heritage.addWill(heir.address, token.address, withdrawalTime, 1))
            .to.be.revertedWith("dWill: Total will for token is more than max uint256")
    })

    it('should update amount to unlimited', async () => {
        //create allowance to contract
        await token.increaseAllowance(heritage.address, ethers.constants.MaxUint256)
        heir = acc2
        await heritage.addWill(heir.address, token.address, withdrawalTime, 10);
        await heritage.addWill(heir.address, token.address, withdrawalTime, 10);
        //new amount
        await expect(heritage.update(
            ID,                  //ID
            withdrawalTime,   //newTime
            heir.address,       //_heir
            ethers.constants.MaxUint256,  //amount
        )).to.be.revertedWith("dWill: Total will for token is more than max uint256")
    })

})