const contractAddresses = {
    Mumbai: '0xDCBdA40D57961b9C7f11d7E155aCbaB80Fb6fE6f',
    Polygon: '',
    BinanceTestnet: '0xC9AdC87b5a612F08dC04802Ca1a0C97d06365e20',
    BinanceMainnet: '',
    EthereumMainnet: '',
    Goerli: '0x1a53400d37D773C7A531605C268185D6e8CCaE61'
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