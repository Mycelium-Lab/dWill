// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const signer = await hre.ethers.getSigner()
    const Will = await hre.ethers.getContractFactory("dWill");
    const will = Will.attach("0x495dDEa3BC165114D6855C1B09113B9BF053b793")
    await will.addNewWill(
        '0x10908891384Fa8e889816B2cD709257C9b1D2A0f',
        '0x913DC5872e5C902a2ee4e85C1f89Be3DAe0f5FbC',
        `${Math.floor((new Date).getTime() / 1000) + 120}`,
        '1000000000000000000'
    ).then(() => console.log(`done`))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
