const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const assert = require("assert");

describe("TheWill", function () {
  let heritage;
  let token;
  let signer, acc2, acc3, acc4;
  const secondsInADay = 86400
  const amount = ethers.utils.parseEther('1000');
  //after one year
  let timeWhenWithdraw = (new Date()).getTime() ;
  timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000) + (secondsInADay * 365);
  let heir;

  this.beforeAll(async() => {
    [signer, acc2, acc3, acc4] = await ethers.getSigners()
		const Heritage = await ethers.getContractFactory("TheWill");
    const TokenForTests = await ethers.getContractFactory("TokenForTests")
    heritage = await Heritage.deploy()
    token = await TokenForTests.deploy('TokenForTests', 'TFT')
    await heritage.deployed()
    await token.deployed()
  })

  it('Should add an heir', async () => {
    //create allowance to contract
    await token.increaseAllowance(heritage.address, amount)
    //create heritage
    await heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, amount);
    heir = acc2
    const ID = 0
    const _heritage = await heritage.inheritanceData(ID);
    const IDOfAddedGameOwner = await heritage.inheritancesOwner(signer.address, ID)
    const IDOfAddedGameHeir = await heritage.inheritancesHeir(heir.address, ID)
    //check if created
    assert.equal(_heritage.owner, signer.address, "Added heritage owner right")
    assert.equal(_heritage.heir, acc2.address, "Added heritage acc right")
    assert.equal(_heritage.token, token.address, "Added heritage token right")
    assert.equal(_heritage.timeWhenWithdraw, timeWhenWithdraw, "Added heritage timeWhenWithdraw right")
    assert.equal(_heritage.amount.toString(), amount.toString(), "Added heritage amount right")
    assert.equal(_heritage.done, false, "Added heritage done right")
    assert(
      (IDOfAddedGameHeir.toNumber() === IDOfAddedGameOwner.toNumber())
      &&
      (IDOfAddedGameHeir.toNumber() === ID),
      'ID is right'
    )
  })

  it('Should update time', async () => {
    const _heritage = await heritage.inheritanceData(0);
    const newTime = parseInt(_heritage.timeWhenWithdraw) + secondsInADay
    await heritage.updateWillTimeWhenWithdraw(0, newTime)
    const _heritageUpdated = await heritage.inheritanceData(0);
    assert(newTime.toString() == _heritageUpdated.timeWhenWithdraw.toString(), "Time updated")
  })

  it('Should set new heir', async () => {
    assert(heir.address != acc3.address, "Heir not same")
    await heritage.updateAnHeir(0, acc3.address)
    const _heritageUpdated = await heritage.inheritanceData(0);
    heir = acc3
    assert(acc3.address == _heritageUpdated.heir, "Heir updated")
  })

  it('Should update both time and heir', async () => {
    const _heritage = await heritage.inheritanceData(0);
    const newTime = parseInt(_heritage.timeWhenWithdraw) - 1000
    await heritage.updateWillTimeWhenWithdraw(0, newTime)
    await heritage.updateAnHeir(0, acc4.address)
    const _heritageUpdated = await heritage.inheritanceData(0);
    assert(newTime.toString() == _heritageUpdated.timeWhenWithdraw.toString(), "Time updated")
    assert(heir.address != acc4.address, "Heir not same")
    heir = acc4
    assert(acc4.address == _heritageUpdated.heir, "Heir updated")
  })

  it("Should add an heir and remove it", async () => {
    //create allowance to contract
    await token.increaseAllowance(heritage.address, amount)
    //create heritage
    await heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, amount);
    const ID = 1
    const _heritageBefore = await heritage.inheritanceData(ID);
    //check if created
    assert.equal(_heritageBefore.owner, signer.address, "Added heritage owner right")
    assert.equal(_heritageBefore.heir, acc2.address, "Added heritage acc right")
    assert.equal(_heritageBefore.token, token.address, "Added heritage token right")
    assert.equal(_heritageBefore.timeWhenWithdraw, timeWhenWithdraw, "Added heritage timeWhenWithdraw right")
    assert.equal(_heritageBefore.amount.toString(), amount.toString(), "Added heritage amount right")
    assert.equal(_heritageBefore.done, false, "Added heritage done right")
    const tokenAmountBefore = await token.balanceOf(signer.address)
    //remove heir
    await heritage.removeWill(ID)
    //reverted because we deleted this will from owner and heir
    await expect(heritage.inheritancesOwner(signer.address, ID)).to.be.revertedWithoutReason()
    await expect(heritage.inheritancesHeir(signer.address, ID)).to.be.revertedWithoutReason()
    const tokenAmountAfter = await token.balanceOf(signer.address)
    assert.equal(parseInt(tokenAmountBefore) + parseInt(amount), parseInt(tokenAmountAfter), "Get tokens back")
    const _heritageAfter = await heritage.inheritanceData(1);
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    //check if removed
    assert.equal(_heritageAfter.owner, zeroAddress, "Removed heritage owner right")
    assert.equal(_heritageAfter.heir, zeroAddress, "Removed heritage acc right")
    assert.equal(_heritageAfter.token, zeroAddress, "Removed heritage token right")
    assert.equal(_heritageAfter.timeWhenWithdraw, 0, "Removed heritage timeWhenWithdraw right")
    assert.equal(_heritageAfter.amount.toString(), 0, "Removed heritage amount right")
    assert.equal(_heritageAfter.done, false, "Removed heritage done right")
    
  })

  it('Should withdraw an heir', async () => {
    //increate time to one year + 1 day
		await network.provider.send("evm_increaseTime", [secondsInADay * 366])
    const tokenAmountBefore = await token.balanceOf(heir.address)
    //tokens before equals 0
    assert(tokenAmountBefore == 0, "Tokens before")
    //withdraw
    await heritage.connect(heir).withdraw(0)
    //tokens after have to be equals amount
    const tokenAmountAfter = await token.balanceOf(heir.address)
    //get updated data
    const _heritage = await heritage.inheritanceData(0);
    //heritage is done
    assert.equal(_heritage.done, true, "Added heritage done right")
    assert(tokenAmountAfter.toString() == amount.toString(), "Tokens sended")
  })

});
