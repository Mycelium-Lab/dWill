// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const dWill = await hre.ethers.getContractFactory("dWill");
  // const Token = await hre.ethers.getContractFactory("TokenForTests");
  const _dWill = await dWill.deploy('0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', '30000000000000000')
  // const tokenForTests = await Token.deploy("TokenForTests", "TFT")
  await _dWill.deployed()
  // await tokenForTests.deployed()
  console.log(`dWill: ${_dWill.address}`)
  // console.log(`Token: ${tokenForTests.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
