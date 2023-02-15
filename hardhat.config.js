require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require('solidity-docgen')
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  },
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
    },
    binanceTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: process.env.POLYGONRPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43114
    },
    bnb: {
      url: "https://bsc-dataseed.binance.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 56
    },
    ethereum: {
      url: process.env.ETHEREUMRPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1
    },
    arbitrum: {
      url: process.env.ARBITRUMRPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42161
    },
    optimism: {
      url: process.env.OPTIMISMRPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10
    },
  },
  solidity: "0.8.17"
};
