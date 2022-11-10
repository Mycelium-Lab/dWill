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
    let timeNow = Math.round((new Date()).getTime() / 1000) ;
    let timeWhenWithdraw = timeNow + secondsInADay * 365 + secondsInADay * 2;
    let timeBetweenWithdrawAndStart = timeWhenWithdraw - timeNow
  
    this.beforeEach(async () => {
      [signer, acc2, acc3, acc4] = await ethers.getSigners()
      const Heritage = await ethers.getContractFactory("dWill");
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
      ).to.be.revertedWith("dWill: Heir is address(0)")
      await expect(
        heritage.addNewWill(acc2.address, zeroAddress, timeWhenWithdraw, amount)
      ).to.be.revertedWith("dWill: Token is address(0)")
      //yesterday
      let _timeWhenWithdraw = (new Date()).getTime();
      _timeWhenWithdraw = Math.round(_timeWhenWithdraw / 1000) - secondsInADay
      //create heritage
      await expect(
        heritage.addNewWill(acc2.address, token.address, _timeWhenWithdraw, amount)
      ).to.be.revertedWith("dWill: Time when withdraw is lower then now")
      //create heritage
      await expect(
        heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, '0')
      ).to.be.revertedWith("dWill: Amount 0")
    })

    it("Should addNewWill() negative cause allowance", async () => {
      //create allowance to contract
      await token.increaseAllowance(heritage.address, amount)
      //create heritage
      await heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, amount);
      //we still not used our allowance from the contract
      const allowance = await token.allowance(signer.address, heritage.address)
      assert(allowance.toString() === amount.toString(), 'Allowance is ok')
      const allAmount = await heritage.getAllWillsAmountThisToken(signer.address, token.address)
      assert(allowance.toString() === allAmount.toString(), 'Allowance is ok')
      //but still have error because
      //all allowance have to be summed up
      await expect(
         heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, amount)
      ).to.be.revertedWith("dWill: Not enough allowance")
    })

    it("Should withdraw() negative", async () => {
       //create allowance to contract
      await token.increaseAllowance(heritage.address, amount)
      //create heritage
      await heritage.addNewWill(acc2.address, token.address, timeWhenWithdraw, amount);
      await expect(
        heritage.connect(acc3).withdraw(0)
      ).to.be.rejectedWith("dWill: You not heir")
      await expect(
        heritage.connect(acc2).withdraw(0)
      ).to.be.rejectedWith("dWill: Time is not over yet")
      //increate time to one year + 1 day
      await network.provider.send("evm_increaseTime", [secondsInADay * 366])
      await heritage.connect(acc2).withdraw(0)
      await expect(
        heritage.connect(acc2).withdraw(0)
      ).to.be.rejectedWith("dWill: Already withdrawn")
    })
  
});