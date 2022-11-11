// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const signer = await hre.ethers.getSigner()
  const Token = await hre.ethers.getContractFactory("TokenForTests");
  const tokenForTests = Token.attach("0x7ad56BdD1d9c70C0C94cA2BF4b1397756dfbbfc8")
  const allowanceBefore = await tokenForTests.allowance(signer.address, '0xc9100D772b0Ddb8D435b54cee1Fe050cf7e5789B')
  await tokenForTests.decreaseAllowance('0xc9100D772b0Ddb8D435b54cee1Fe050cf7e5789B', allowanceBefore.toString())
  const allowanceAfter = await tokenForTests.allowance(signer.address, '0xc9100D772b0Ddb8D435b54cee1Fe050cf7e5789B')
  console.log(`Allowance Before: ${allowanceBefore.toString()}`)
  console.log(`Allowance After: ${allowanceAfter.toString()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
