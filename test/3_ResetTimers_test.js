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
    let timeWhenWithdraw = (new Date()).getTime();
    timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000) + secondsInADay * 365 * 3 + secondsInADay * 2;

    this.beforeAll(async () => {
        [signer, acc2, acc3, acc4] = await ethers.getSigners()
        const Heritage = await ethers.getContractFactory("TheWill");
        const TokenForTests = await ethers.getContractFactory("TokenForTests")
        heritage = await Heritage.deploy()
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
            await heritage.addNewWill(heir.address, token.address, timeWhenWithdraw, ethers.utils.parseEther(tokenAmountPerOne.toString()));
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
        const _heritage = await heritage.getAllWills(signer.address)
        for (let i = 0; i < toTest; i++) {
            timesWhenWithdrawBefore[i] =_heritage[i].timeWhenWithdraw
        }
        //increase time + 1 years
        await network.provider.send("evm_increaseTime", [secondsInADay * 365])
        //reset timers
        await heritage.resetTimers()
        const _heritageAfter = await heritage.getAllWills(signer.address)
        for (let i = 0; i < toTest; i++) {
            timesWhenWithdrawAfter[i] =_heritageAfter[i].timeWhenWithdraw
        }
        //new time time when withdraw will be more than a year but less than a year and one day
        //it depends on the time of processing the test by the computer
        assert((timesWhenWithdrawAfter[0] - timesWhenWithdrawBefore[0]) >= (secondsInADay * 365))
        assert((timesWhenWithdrawAfter[0] - timesWhenWithdrawBefore[0]) < (secondsInADay * 365 + secondsInADay))
    })

})