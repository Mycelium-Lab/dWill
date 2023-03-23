## **[dWill](https://dwill.app/)** - The first fully decentralized way to bequeath your cryptocurrency.

*dWill* - Is the first decentralized non-custodial inheritance protocol. 
With *dWill*, you can bequeath any ERC-20 tokens from your cryptocurrency wallet to the trusted wallets of your family and friends (or, for example, to your reserve wallet). Thanks to smart contract technology, *dWill* works completely in a decentralized way, reliably and autonomously. No one (no one at all, not even the project team) will have access to the funds you bequeathed.

# Smart Contracts
## Development

1. Create and fill in `.env` file using `.env.org` example file

2. Run `npm i` to install all packages

3. Compile all contracts before running migrations `npx hardhat compile`

4. Deploy with `npx hardhat run ./scripts/deploy.js --network <network>`


## Testing

To run tests run `npx hardhat test` in the console.


## Docs

Docs to all dWill functions are located in `/docs/index.md`. 
`dWill.sol` also contains comments to all functions describing what the function does, parameters and return values.


## Deployments
1. polygon: `0x9be6b572afbCEBe76efC6918cd8447e90F15DC9D`
2. bnb: `0x5f94366adDAa8938441d3091D9702C99aEfA455E`
3. arbitrum: `0x9c84C93506551B9212F86c0b020c53CFFF072106`
4. avalanche: `0x01201A6b62e9ea9B608bCDC400Cf32ADC9cd85Bc`
5. optimism: `0xE19C894816F985A1EA6edf91b173b5fd0E82B444`
6. ethereum: `0x525e51A7fbb82376277866eb5256Ed3befAE8089`
