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
    let withdrawalTime = timeNow + secondsInADay * 365 + secondsInADay * 2;
    let timeInterval = withdrawalTime - timeNow
  
    this.beforeEach(async () => {
      [signer, acc2, acc3, acc4] = await ethers.getSigners()
      const Heritage = await ethers.getContractFactory("dWill");
      const TokenForTests = await ethers.getContractFactory("TokenForTests")
      heritage = await Heritage.deploy('0x0000000000000000000000000000000000000001', 0)
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
        heritage.addWill(zeroAddress, token.address, withdrawalTime, amount)
      ).to.be.revertedWith("dWill: Heir is address(0)")
      await expect(
        heritage.addWill(acc2.address, zeroAddress, withdrawalTime, amount)
      ).to.be.revertedWith("dWill: Token is address(0)")
      //yesterday
      let _withdrawalTime = (new Date()).getTime();
      _withdrawalTime = Math.round(_withdrawalTime / 1000) - secondsInADay
      //create heritage
      await expect(
        heritage.addWill(acc2.address, token.address, _withdrawalTime, amount)
      ).to.be.revertedWith("dWill: Withdrawal time has already expired")
      //create heritage
      await expect(
        heritage.addWill(acc2.address, token.address, withdrawalTime, '0')
      ).to.be.revertedWith("dWill: Amount is 0")
    })

    it("Should addWill() negative cause allowance", async () => {
      //create allowance to contract
      await token.increaseAllowance(heritage.address, amount)
      //create heritage
      await heritage.addWill(acc2.address, token.address, withdrawalTime, amount);
      //we still not used our allowance from the contract
      const allowance = await token.allowance(signer.address, heritage.address)
      assert(allowance.toString() === amount.toString(), 'Allowance is ok')
      const allAmount = await heritage.willAmountForToken(signer.address, token.address)
      assert(allowance.toString() === allAmount.toString(), 'Allowance is ok')
      //but still have error because
      //all allowance have to be summed up
      await expect(
         heritage.addWill(acc2.address, token.address, withdrawalTime, amount)
      ).to.be.revertedWith("dWill: Not enough allowance")
    })

    it("Should withdraw() negative", async () => {
      //create allowance to contract
      await token.increaseAllowance(heritage.address, amount)
      //create heritage
      await heritage.addWill(acc2.address, token.address, withdrawalTime, amount);
      await expect(
        heritage.connect(acc2).withdraw(1)
      ).to.be.rejectedWith("dWill: Withdrawal is not yet available")
      //increate time to one year + 1 day
      await network.provider.send("evm_increaseTime", [secondsInADay * 366])
      await expect(
        heritage.connect(acc3).withdraw(1)
      ).to.be.rejectedWith("dWill: Caller is not the heir")
      await heritage.connect(acc2).withdraw(1)
      await expect(
        heritage.connect(acc2).withdraw(1)
      ).to.be.rejectedWith("dWill: Already withdrawn")
    })
  
});