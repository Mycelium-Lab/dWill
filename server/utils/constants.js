const contractAddresses = {
    Mumbai: '0x495dDEa3BC165114D6855C1B09113B9BF053b793',
    Polygon: '',
    BinanceTestnet: '0xc1396050fb3042b33dB5535AA4711916b52Ac61d',
    BinanceMainnet: '',
    EthereumMainnet: '',
    Goerli: '0x044D55DE6E02edc857F68E3D3434c43F23460D2C'
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