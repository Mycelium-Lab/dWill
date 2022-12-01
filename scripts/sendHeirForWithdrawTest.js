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
    const will = Will.attach("0xf79236FACf56B264a0E146a2096126C1e28D7E31")
    //0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4
    //0xa36481Ae3b6313B99b0B3aD8f749cD187CEcB514
    await will.addNewWill(
        '0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7',
        '0x40415ea781dD3970A4f3703a6011383b7B8715Ac',
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
