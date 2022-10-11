// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Heritage = await hre.ethers.getContractFactory("TheWill");
  const Token = await hre.ethers.getContractFactory("TokenForTests");
  const heritage = await Heritage.deploy()
  const tokenForTests = await Token.deploy("TokenForTests", "TFT")
  await heritage.deployed()
  await tokenForTests.deployed()
  console.log(`TheWill: ${heritage.address}`)
  console.log(`Token: ${tokenForTests.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
