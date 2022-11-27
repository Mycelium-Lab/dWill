const contractAddresses = {
    Mumbai: '0x16F88074E86Ea5aee41AA2716E02271921eb8019',
    Polygon: '',
    BinanceTestnet: '0xd4e8F7fda974e25Ef832c20D2b1725d3363dBb57',
    BinanceMainnet: '',
    EthereumMainnet: '',
    Goerli: '0xbE2DA600Fabf97305F195E5C021868Bf619774FE'
}

const NetworkExplorers = {
    Polygon: 'https://explorer.matic.network/address/',
    Mumbai: 'https://mumbai.polygonscan.com/address/',
    BinanceTestnet: 'https://testnet.bscscan.com/address/',
    BinanceMainnet: 'https://bscscan.com/address/',
    EthereumMainnet: 'https://etherscan.io/address/',
    Goerli: 'https://goerli.etherscan.io/address/'
}

module.exports = {
    contractAddresses,
    NetworkExplorers
}