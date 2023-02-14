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
    // const amount = ethers.utils.parseEther(`${tokenAmountPerOne * toTest}`);
    //after one year
    // let timeBetweenWithdrawAndStart = timeWhenWithdraw - timeNow

    this.beforeEach(async () => {
        [signer, acc2, acc3, acc4, acc5, acc6] = await ethers.getSigners()
        const Heritage = await ethers.getContractFactory("dWill");
        const TokenForTests = await ethers.getContractFactory("TokenForTests")
        heritage = await Heritage.deploy()
        token = await TokenForTests.deploy('TokenForTests', 'TFT')
        await heritage.deployed()
        await token.deployed()
    })

    it('should check withdraw if balance < allowance', async () => {
        let timeNow = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        let timeWhenWithdraw = timeNow + secondsInADay
        const currentBalanceOwner = BigInt(await token.balanceOf(signer.address))
        const currentBalanceHeir = await token.balanceOf(acc2.address)
        assert(currentBalanceHeir == 0, `Heir dont have tokens yet`)
        const amountMoreThanBalance = currentBalanceOwner + BigInt(ethers.utils.parseEther('1000'))
        //add more amount of allowance that exist currently on balance
        await token.increaseAllowance(heritage.address, amountMoreThanBalance.toString())
        await heritage.addWill(
            acc2.address, token.address, timeWhenWithdraw, amountMoreThanBalance.toString()
        )
		await network.provider.send("evm_increaseTime", [secondsInADay])
        await heritage.connect(acc2).withdraw(0)
        const balanceAfterWithdrawOwner = await token.balanceOf(signer.address)
        const balanceAfterWithdrawHeir = await token.balanceOf(acc2.address)
        assert(currentBalanceOwner == balanceAfterWithdrawHeir, `We sent to heir`)
        assert(balanceAfterWithdrawOwner == 0, `We sent only our balance w/o error`)
    })
    
    it('should check withdraw if allowance < amount in will (user decreased value)', async () => {
        let timeNow = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        let timeWhenWithdraw = timeNow + secondsInADay * 2
        const currentBalanceOwner = BigInt(await token.balanceOf(signer.address))
        const currentBalanceHeir = await token.balanceOf(acc2.address)
        assert(currentBalanceHeir == 0, `Heir dont have tokens yet`)
        //add all balance allowance
        await token.increaseAllowance(heritage.address, currentBalanceOwner.toString())
        await heritage.addWill(
            acc2.address, token.address, timeWhenWithdraw, currentBalanceOwner.toString()
        )
        //add all balance allowance
        await token.decreaseAllowance(heritage.address, ethers.utils.parseEther('1000').toString())
        const currentAllowance = await token.allowance(signer.address, heritage.address)
        //check if current allowance is lower than before
        assert(currentAllowance < currentBalanceOwner, 'Allowance lower')
		await network.provider.send("evm_increaseTime", [secondsInADay * 3])
        await heritage.connect(acc2).withdraw(0)
        const balanceAfterWithdrawHeir = await token.balanceOf(acc2.address)
        const balanceAfterWithdrawOwner = await token.balanceOf(signer.address)
        assert(currentAllowance.toString() === balanceAfterWithdrawHeir.toString(), `We sent to heir allowance`)
        assert(balanceAfterWithdrawOwner > 0, `We sent only not all balance w/o error`)
    })

    it('should check withdraw if there is 2 wills to one acc', async () => {
        let timeNow = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        let timeWhenWithdraw = timeNow + secondsInADay * 2
        const currentHalfBalanceOwner = BigInt(await token.balanceOf(signer.address) / 2)
        const currentBalanceHeir = await token.balanceOf(acc2.address)
        assert(currentBalanceHeir == 0, `Heir dont have tokens yet`)
        //add all balance allowance
        await token.increaseAllowance(heritage.address, currentHalfBalanceOwner.toString())
        await token.increaseAllowance(heritage.address, currentHalfBalanceOwner.toString())
        await heritage.addWill(
            acc2.address, token.address, timeWhenWithdraw, currentHalfBalanceOwner.toString()
        )
        await heritage.addWill(
            acc2.address, token.address, timeWhenWithdraw, currentHalfBalanceOwner.toString()
        )
		await network.provider.send("evm_increaseTime", [secondsInADay * 3])
        await heritage.connect(acc2).withdraw(0)
        const balanceAfterWithdrawHeir = await token.balanceOf(acc2.address)
        assert(balanceAfterWithdrawHeir.toString() === currentHalfBalanceOwner.toString(), 'return only data amount')
        await heritage.connect(acc2).withdraw(1)
        const balanceAfterWithdrawHeir2 = await token.balanceOf(acc2.address)
        assert(balanceAfterWithdrawHeir2.toString() === (currentHalfBalanceOwner + currentHalfBalanceOwner).toString(), 'return only data amount')
    })

    it('should check withdraw if allowance < balance < amount', async () => {
        let timeNow = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        let timeWhenWithdraw = timeNow + secondsInADay
        const currentBalanceOwner = BigInt(await token.balanceOf(signer.address))
        const currentBalanceHeir = await token.balanceOf(acc2.address)
        assert(currentBalanceHeir == 0, `Heir dont have tokens yet`)
        const amountMoreThanBalance = currentBalanceOwner + BigInt(ethers.utils.parseEther('1000'))
        //add more amount of allowance that exist currently on balance
        await token.increaseAllowance(heritage.address, amountMoreThanBalance.toString())
        await heritage.addWill(
            acc2.address, token.address, timeWhenWithdraw, amountMoreThanBalance.toString()
        )
        //decrease allowance
        const decreaseAmount = BigInt(ethers.utils.parseEther('476'))
        await token.decreaseAllowance(heritage.address, BigInt(ethers.utils.parseEther('1000')) + decreaseAmount)
        const allowance = await token.allowance(signer.address, heritage.address)

		await network.provider.send("evm_increaseTime", [secondsInADay])
        await heritage.connect(acc2).withdraw(0)
        const balanceAfterWithdrawOwner = await token.balanceOf(signer.address)
        const balanceAfterWithdrawHeir = await token.balanceOf(acc2.address)
        assert(allowance.toString() == balanceAfterWithdrawHeir, `We sent allowance to heir`)
        assert(balanceAfterWithdrawOwner.toString() == (currentBalanceOwner - BigInt(allowance)).toString(), `We sent only our allowance w/o error`)
    })
})