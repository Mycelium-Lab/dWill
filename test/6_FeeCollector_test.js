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
  const fee1 = '50000000000000000'
  const fee2 = '40000000000000000'
  const oneEther = '1000000000000000000'

  this.beforeAll(async() => {
    [signer, acc2, acc3, acc4] = await ethers.getSigners()
		const Heritage = await ethers.getContractFactory("dWill");
    const TokenForTests = await ethers.getContractFactory("TokenForTests")
    heritage = await Heritage.deploy(acc3.address, fee1)
    token = await TokenForTests.deploy('TokenForTests', 'TFT')
    await heritage.deployed()
    await token.deployed()
  })

  it('Sets feeCollector & fee', async () => {
    const owner = await heritage.owner()
    assert.equal(owner, signer.address, "Owner initialized correctly")

    const feeCollector = await heritage.feeCollector()
    assert.equal(feeCollector, acc3.address, "Fee collector initialized correctly")

    const fee = await heritage.fee()
    assert.equal(fee, fee1, "Fee initialized correctly")
  })

  it('Only owner can change fees', async () => {
    const newFeeCollector = acc4.address
    const newFee = fee2
    await expect(heritage.connect(acc3).setFeeCollector(newFeeCollector)).to.be.revertedWith("Ownable: caller is not the owner")
    await expect(heritage.connect(acc3).setFee(newFee)).to.be.revertedWith("Ownable: caller is not the owner")

    await expect(heritage.setFeeCollector(newFeeCollector))
      .to.emit(heritage, "SetFeeCollector")
      .withArgs(acc3.address, newFeeCollector);
    await expect(heritage.setFee(newFee))
      .to.emit(heritage, "SetFee")
      .withArgs(fee1, newFee);

    const feeCollector = await heritage.feeCollector()
    assert.equal(feeCollector, newFeeCollector, "Fee collector set correctly")

    const fee = await heritage.fee()
    assert.equal(fee, newFee, "Fee set correctly")

    await expect(heritage.setFee(BigInt(fee1) + BigInt('1'))).to.be.revertedWith("dWill: Fee must be lower or equal 5%")
  })

  it('Should withdraw right tokens amount', async () => {
    //create allowance to contract
    await token.increaseAllowance(heritage.address, amount)
    //create heritage
    const heir = acc2

    const timeNow = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
    const withdrawalTime = timeNow + (secondsInADay * 365);
    await heritage.addWill(heir.address, token.address, withdrawalTime, amount)

    await network.provider.send("evm_increaseTime", [secondsInADay * 365])

    const tokenAmountBefore = await token.balanceOf(heir.address)
    const feeCollectorBefore = await token.balanceOf(acc4.address)
    assert(tokenAmountBefore == 0, "Tokens before")
    assert(feeCollectorBefore == 0, "FeeCollector tokens before")
    await expect(heritage.connect(heir).withdraw(0))
      .to.emit(heritage, "CollectFee")
      .withArgs(0, token.address, (BigInt(amount) * BigInt(fee2) / BigInt(oneEther)).toString());
    const tokenAmountAfter = await token.balanceOf(heir.address)
    const feeCollectorAfter = await token.balanceOf(acc4.address)

    assert((BigInt(amount) - (BigInt(amount) * BigInt(fee2) / BigInt(oneEther))).toString() == tokenAmountAfter.toString(), "Tokens sent")
    assert((BigInt(amount) * BigInt(fee2) / BigInt(oneEther)).toString() == feeCollectorAfter.toString(), "Tokens sent")

  })
});
