require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    testnet: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    goerli: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 5,
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: "0.8.17"
};
