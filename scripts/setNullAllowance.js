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
  const tokenForTests = Token.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
  const allowanceBefore = await tokenForTests.allowance(signer.address, '0x5FbDB2315678afecb367f032d93F642f64180aa3')
  await tokenForTests.decreaseAllowance('0x5FbDB2315678afecb367f032d93F642f64180aa3', allowanceBefore.toString())
  const allowanceAfter = await tokenForTests.allowance(signer.address, '0x5FbDB2315678afecb367f032d93F642f64180aa3')
  console.log(`Allowance Before: ${allowanceBefore.toString()}`)
  console.log(`Allowance After: ${allowanceAfter.toString()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
