const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  
  describe("TheWillWithWrongData", function () {
    let heritage;
    let token;
    let signer, acc2, acc3, acc4;
    const secondsInADay = 86400
    const amount = ethers.utils.parseEther('1000');
    //after one year
    let timeWhenWithdraw = (new Date()).getTime();
    timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000) + secondsInADay * 365 + secondsInADay * 2;
  
    this.beforeEach(async () => {
      [signer, acc2, acc3, acc4] = await ethers.getSigners()
      const Heritage = await ethers.getContractFactory("TheWill");
      const TokenForTests = await ethers.getContractFactory("TokenForTests")
      heritage = await Heritage.deploy()
      token = await TokenForTests.deploy('TokenForTests', 'TFT')
      await heritage.deployed()
      await token.deployed()
    })

    it("Should addAnHeir() negative", async () => {
      const zeroAddress = "0x0000000000000000000000000000000000000000"
      //create allowance to contract
      await token.increaseAllowance(heritage.address, amount)
      //create heritage
      await expect(
        heritage.addNewWill(zeroAddress, token.address, timeWhenWithdraw, amount)
      ).to.be.revertedWith("Heritage: Heir is address(0)")
      await expect(
        heritage.addNewWill(acc2.address, zeroAddress, timeWhenWithdraw, amount)
      ).to.be.revertedWith("Heritage: Token is address(0)")
      //yesterday
      let _timeWhenWithdraw = (new Date()).getTime();
      _timeWhenWithdraw = Math.round(_timeWhenWithdraw / 1000) - secondsInADay
      //create heritage
      await expect(
        heritage.addNewWill(acc2.address, token.address, _timeWhenWithdraw, amount)
      ).to.be.revertedWith("Heritage: Time when withdraw is lower then now")
      //create heritage
      await expect(
        heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, '0')
      ).to.be.revertedWith("Heritage: Amount 0")
    })

    it("Should withdraw() negative", async () => {
       //create allowance to contract
      await token.increaseAllowance(heritage.address, amount)
      //create heritage
      await heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, amount);
      await expect(
        heritage.connect(acc3).withdraw(0)
      ).to.be.rejectedWith("Heritage: You not heir")
      await expect(
        heritage.connect(acc2).withdraw(0)
      ).to.be.rejectedWith("Heritage: Time is not over yet")
      //increate time to one year + 1 day
      await network.provider.send("evm_increaseTime", [secondsInADay * 366])
      await heritage.connect(acc2).withdraw(0)
      await expect(
        heritage.connect(acc2).withdraw(0)
      ).to.be.rejectedWith("Heritage: Already withdrawn")
    })
  
});