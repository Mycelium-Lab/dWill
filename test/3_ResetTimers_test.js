const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  
  describe("TheWillResetTimers", function () {
    let heritage;
    let token;
    let heir;
    let signer, acc2, acc3, acc4;
    const secondsInADay = 86400
    const toTest = 100;
    const tokenAmountPerOne = 1;
    const amount = ethers.utils.parseEther(`${tokenAmountPerOne * toTest}`);
    //after one year
    let timeNow = Math.round((new Date()).getTime() / 1000) ;
    let withdrawalTime = timeNow + secondsInADay * 365 * 3 + secondsInADay * 2;
    let timeInterval = withdrawalTime - timeNow
    const IDs = []

    this.beforeAll(async () => {
        [signer, acc2, acc3, acc4] = await ethers.getSigners()
        const Heritage = await ethers.getContractFactory("dWill");
        const TokenForTests = await ethers.getContractFactory("TokenForTests")
        heritage = await Heritage.deploy('0x0000000000000000000000000000000000000001', 0)
        token = await TokenForTests.deploy('TokenForTests', 'TFT')
        await heritage.deployed()
        await token.deployed()
    })

    it('should create will', async () => {
        //create allowance to contract
        await token.increaseAllowance(heritage.address, amount)
        await token.transfer(acc3.address, ethers.utils.parseEther(`${toTest * toTest}`))
        await token.connect(acc3).increaseAllowance(heritage.address, ethers.utils.parseEther(`${toTest * toTest}`))
        heir = acc2
        for (let i = 0; i < toTest; i++) {
            await heritage.addWill(heir.address, token.address, withdrawalTime, ethers.utils.parseEther(tokenAmountPerOne.toString()));
            IDs.push(i)
        }
    })

    //if we said that the withdrawal time will be 25.02.2050, 
    //when the time when we created the heritage is 25.02.2040 
    //the time between will be 10 years
    //but if in 25.02.2041 we will reset timers
    //withdrawal time will be 25.02.2051
    //still 10 years
    it('should reset timers', async () => {
        let timesWhenWithdrawBefore = []
        let timesWhenWithdrawAfter = []
        for (let i = 0; i < toTest; i++) {
            const _heritage = await heritage.getWill(signer.address, i)
            timesWhenWithdrawBefore[i] =_heritage.withdrawalTime
        }
        //increase time + 1 years
        await network.provider.send("evm_increaseTime", [secondsInADay * 365])
        //reset timers
        await heritage.resetTimers(IDs)
        for (let i = 0; i < toTest; i++) {
            const _heritage = await heritage.getWill(signer.address, i)
            timesWhenWithdrawAfter[i] =_heritage.withdrawalTime
        }
        //new time time when withdraw will be more than a year minus one day but less than a year and one day
        //it depends on the time of processing the test by the computer
        assert((timesWhenWithdrawAfter[0] - timesWhenWithdrawBefore[0]) >= secondsInADay * 365 - secondsInADay)
        assert((timesWhenWithdrawAfter[0] - timesWhenWithdrawBefore[0]) < secondsInADay * 365 + secondsInADay)
    })

})