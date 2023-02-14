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
  let amount = ethers.utils.parseEther('1000');
  //after one year
  const timeNow = Math.round((new Date()).getTime() / 1000) ;
  const withdrawalTime = timeNow + (secondsInADay * 365);
  const timeInterval = withdrawalTime - timeNow
  let heir;

  this.beforeAll(async() => {
    [signer, acc2, acc3, acc4] = await ethers.getSigners()
		const Heritage = await ethers.getContractFactory("dWill");
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
    heir = acc2
    const ID = 0
    await expect(heritage.addWill(heir.address, token.address, withdrawalTime, amount))
      .to.emit(heritage, "AddWill")
      .withArgs(ID, signer.address, heir.address, token.address, withdrawalTime, amount);
    const _heritage = await heritage.willData(ID);
    const IDOfAddedGameOwner = await heritage.ownerWills(signer.address, ID)
    const IDOfAddedGameHeir = await heritage.heirInheritances(heir.address, ID)
    //check if created
    assert.equal(_heritage.ID.toString(), ID.toString(), "Added heritage id right")
    assert.equal(_heritage.owner, signer.address, "Added heritage owner right")
    assert.equal(_heritage.heir, heir.address, "Added heritage acc right")
    assert.equal(_heritage.token, token.address, "Added heritage token right")
    assert.equal(_heritage.withdrawalTime, withdrawalTime, "Added heritage withdrawalTime right")
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
    const _heritage = await heritage.willData(0);
    const newTime = parseInt(_heritage.withdrawalTime) + secondsInADay
    await expect(heritage.updateWithdrawalTime(0, 0)).to.be.revertedWith("dWill: Withdrawal time has already expired")
    await expect(heritage.connect(heir).updateWithdrawalTime(0, newTime)).to.be.revertedWith('dWill: Caller is not the owner')
    await expect(heritage.updateWithdrawalTime(0, newTime))
      .to.emit(heritage, "UpdateWithdrawalTime")
      .withArgs(0, _heritage.withdrawalTime, newTime);
    const _heritageUpdated = await heritage.willData(0);
    assert(newTime.toString() == _heritageUpdated.withdrawalTime.toString(), "Time updated")
  })

  it('Should set new heir', async () => {
    assert(heir.address != acc3.address, "Heir not same")
    await expect(heritage.updateHeir(0, "0x0000000000000000000000000000000000000000")).to.be.revertedWith("dWill: Heir is address(0)")
    await expect(heritage.connect(heir).updateHeir(0, acc3.address)).to.be.revertedWith('dWill: Caller is not the owner')
    await expect(heritage.updateHeir(0, acc3.address))
      .to.emit(heritage, "UpdateHeir")
      .withArgs(0, heir.address, acc3.address);
    await expect(heritage.updateHeir(0, acc3.address)).to.be.revertedWith("dWill: New heir is the same")

    const _heritageUpdated = await heritage.willData(0);
    heir = acc3
    assert(heir.address == _heritageUpdated.heir, "Heir updated")
    const _inheritance = await heritage.heirInheritances(heir.address, 0)
    assert(_inheritance.toString() == '0', "Inheritance updated")
  })

  it('Should update amount', async () => {
    const amountBefore = amount
    const badAmount = ethers.utils.parseEther('1001'); // more than approval
    await expect(heritage.updateAmount(0, badAmount)).to.be.revertedWith('dWill: Not enough allowance')

    amount = ethers.utils.parseEther('789');
    await expect(heritage.connect(heir).updateAmount(0, amount)).to.be.revertedWith('dWill: Caller is not the owner')
    await expect(heritage.updateAmount(0, amount))
      .to.emit(heritage, "UpdateAmount")
      .withArgs(0, amountBefore, amount);
    const _heritageUpdated = await heritage.willData(0);

    assert(_heritageUpdated.amount.toString() == amount.toString(), "Amount updated")
  })

  it("Should add an heir and remove it", async () => {
    //create allowance to contract
    await token.increaseAllowance(heritage.address, amount)
    const allowanceBefore = await token.allowance(signer.address, heritage.address)
    //create heritage
    const ID = 1
    await expect(heritage.addWill(acc4.address, token.address, withdrawalTime, amount))
      .to.emit(heritage, "AddWill")
      .withArgs(ID, signer.address, acc4.address, token.address, withdrawalTime, amount);
    const _heritageBefore = await heritage.willData(ID);
    //check if created
    assert.equal(_heritageBefore.ID.toString(), ID.toString(), "Added heritage id right")
    assert.equal(_heritageBefore.owner, signer.address, "Added heritage owner right")
    assert.equal(_heritageBefore.heir, acc4.address, "Added heritage acc right")
    assert.equal(_heritageBefore.token, token.address, "Added heritage token right")
    assert.equal(_heritageBefore.withdrawalTime, withdrawalTime, "Added heritage withdrawalTime right")
    assert.equal(_heritageBefore.amount.toString(), amount.toString(), "Added heritage amount right")
    assert.equal(_heritageBefore.done, false, "Added heritage done right")

    await expect(heritage.connect(heir).removeWill(ID)).to.be.revertedWith('dWill: Caller is not the owner')
    await expect(heritage.removeWill(ID))
      .to.emit(heritage, "RemoveWill")
      .withArgs(ID, signer.address, acc4.address);
    const allowanceAfter = await token.allowance(signer.address, heritage.address)
    assert(allowanceBefore, allowanceAfter, 'Removed allowance')
    //reverted because we deleted this will from owner and heir
    await expect(heritage.ownerWills(signer.address, ID)).to.be.revertedWithoutReason()
    await expect(heritage.heirInheritances(acc4.address, ID)).to.be.revertedWithoutReason()
    const _heritageAfter = await heritage.willData(1);
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    //check if removed
    assert.equal(_heritageAfter.owner, zeroAddress, "Removed heritage owner right")
    assert.equal(_heritageAfter.heir, zeroAddress, "Removed heritage acc right")
    assert.equal(_heritageAfter.token, zeroAddress, "Removed heritage token right")
    assert.equal(_heritageAfter.withdrawalTime, 0, "Removed heritage withdrawalTime right")
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
    await expect(heritage.connect(signer).withdraw(0)).to.be.revertedWith('dWill: Caller is not the heir')
    await heritage.connect(heir).withdraw(0)
    //tokens after have to be equals amount
    const tokenAmountAfter = await token.balanceOf(heir.address)
    //get updated data
    const _heritage = await heritage.willData(0);
    //heritage is done
    assert.equal(_heritage.done, true, "Added heritage done right")
    assert(tokenAmountAfter.toString() == amount.toString(), "Tokens sent")

    await expect(heritage.updateWithdrawalTime(0, 0)).to.be.revertedWith("dWill: Already withdrawn")
    await expect(heritage.updateHeir(0, "0x0000000000000000000000000000000000000000")).to.be.revertedWith("dWill: Already withdrawn")
    await expect(heritage.updateAmount(0, 0)).to.be.revertedWith('dWill: Already withdrawn')
    await expect(heritage.removeWill(0)).to.be.revertedWith('dWill: Already withdrawn')
  })
});
