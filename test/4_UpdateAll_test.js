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
    let timeWhenWithdraw = timeNow + secondsInADay * 365 * 5 + secondsInADay * 2;
    let timeBetweenWithdrawAndStart = timeWhenWithdraw - timeNow

    this.beforeEach(async () => {
        [signer, acc2, acc3, acc4, acc5, acc6] = await ethers.getSigners()
        const Heritage = await ethers.getContractFactory("dWill");
        const TokenForTests = await ethers.getContractFactory("TokenForTests")
        heritage = await Heritage.deploy()
        token = await TokenForTests.deploy('TokenForTests', 'TFT')
        await heritage.deployed()
        await token.deployed()
    })

    it('should create will and update all', async () => {
        //create allowance to contract
        await token.increaseAllowance(heritage.address, amount)
        heir = acc2
        await heritage.addNewWill(heir.address, token.address, timeWhenWithdraw, ethers.utils.parseEther(tokenAmountPerOne.toString()));
        //new heir
        heir = acc3
        //new time
        timeWhenWithdraw = timeWhenWithdraw + 1000
        //new amount
        tokenAmountPerOne = tokenAmountPerOne + 1
        await heritage.update(
            ID,                  //ID
            timeWhenWithdraw,   //newTime
            heir.address,       //_heir
            ethers.utils.parseEther(tokenAmountPerOne.toString()),  //amount
            true,               //_updateTime
            true,               //_updateHeir
            true                //_updateAmount
        )
        const _updatedHeritage = await heritage.inheritanceData(ID)
        assert(_updatedHeritage.heir == heir.address, 'Heir updated')
        assert(_updatedHeritage.timeWhenWithdraw.toString() == timeWhenWithdraw.toString(), 'Time updated')
        assert(_updatedHeritage.amount.toString() == ethers.utils.parseEther(tokenAmountPerOne.toString()).toString(), 'Amount updated')
    })
    
    it('should update all but without amount', async () => {
        const willAmount = ethers.utils.parseEther(tokenAmountPerOne.toString())
        //create allowance to contract
        await token.increaseAllowance(heritage.address, amount)
        heir = acc2
        await heritage.addNewWill(heir.address, token.address, timeWhenWithdraw, willAmount);
        //new heir
        heir = acc3
        //new time
        timeWhenWithdraw = timeWhenWithdraw + 1000
        await heritage.update(
            ID,                  //ID
            timeWhenWithdraw,   //newTime
            heir.address,       //_heir
            0,  //amount
            true,               //_updateTime
            true,               //_updateHeir
            false                //_updateAmount
        )
        const _updatedHeritage = await heritage.inheritanceData(ID)
        assert(_updatedHeritage.heir == heir.address, 'Heir updated')
        assert(_updatedHeritage.timeWhenWithdraw.toString() == timeWhenWithdraw.toString(), 'Time updated')
        assert(_updatedHeritage.amount.toString() == willAmount.toString(), 'Amount not updated')
    })

    it('should update all decrease amount but without time', async () => {
        //create allowance to contract
        await token.increaseAllowance(heritage.address, amount)
        heir = acc2
        await heritage.addNewWill(heir.address, token.address, timeWhenWithdraw, ethers.utils.parseEther(tokenAmountPerOne.toString()));
        //new heir
        heir = acc3
        //new amount
        tokenAmountPerOne = tokenAmountPerOne - 1
        const _heritageBefore = await heritage.inheritanceData(ID)
        const _amountBefore = _heritageBefore.amount
        const _timeBefore = _heritageBefore.timeWhenWithdraw
        await heritage.update(
            ID,                  //ID
            0,   //newTime
            heir.address,       //_heir
            ethers.utils.parseEther(tokenAmountPerOne.toString()),  //amount
            false,               //_updateTime
            true,               //_updateHeir
            true                //_updateAmount
        )
        const _updatedHeritage = await heritage.inheritanceData(ID)
        assert(_updatedHeritage.heir == heir.address, 'Heir updated')
        assert(_updatedHeritage.timeWhenWithdraw.toString() == _timeBefore.toString(), 'Time not updated')
        assert(_updatedHeritage.amount < _amountBefore, 'Amount updated')
    })

    it('should update all but without heir', async () => {
        //create allowance to contract
        await token.increaseAllowance(heritage.address, amount)
        heir = acc2
        await heritage.addNewWill(heir.address, token.address, timeWhenWithdraw, ethers.utils.parseEther(tokenAmountPerOne.toString()));
        //new time
        timeWhenWithdraw = timeWhenWithdraw + 1000
        //new amount
        tokenAmountPerOne = tokenAmountPerOne + 1
        const _heritageBefore = await heritage.inheritanceData(ID)
        const _heirBefore = _heritageBefore.heir
        await heritage.update(
            ID,                  //ID
            timeWhenWithdraw,   //newTime
            acc5.address,       //_heir
            ethers.utils.parseEther(tokenAmountPerOne.toString()),  //amount
            true,               //_updateTime
            false,               //_updateHeir
            true                //_updateAmount
        )
        const _updatedHeritage = await heritage.inheritanceData(ID)
        assert(_updatedHeritage.heir == _heirBefore, 'Heir not updated')
        assert(_updatedHeritage.timeWhenWithdraw.toString() == timeWhenWithdraw.toString(), 'Time updated')
        assert(_updatedHeritage.amount.toString() == ethers.utils.parseEther(tokenAmountPerOne.toString()).toString(), 'Amount updated')
    })

})