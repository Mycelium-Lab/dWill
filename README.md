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
1. polygon: `0x5f193874FBbEbc4bF792CDb51B763e90596773F6`
2. bnb: `0xE93519C3a0Df81D47AD044bc93e7e041E2ff564A`
3. arbitrum: `0x9E9C2F2E5B4B2456F9D63F6eFC163A889E71d777`
4. avalanche: `0x79707Aa99190db9403d911BA5e432d90772b5367`
5. optimism: `0xa81d5C457FD9C4a58E3A23213504CD461eD870Fd`
6. ethereum: still in deployment [tx: `0x3c3c26e8be995dd6892b1dd90b0bfbca61ace7217e18ab16d0d8c5676fd0d1d4`]
