
import { ethers } from "ethers";
import { Component } from 'react';

import './App.css';


import Connect from './Utils/Connect';
import TheWill from './Contract/TheWill.json'
import { TheWillAddress } from './Utils/Constants';
import Data from './Data/Data';
import Main from './Main/Main';
import logo from '../content/logo.svg';
class App extends Component {

  state = { 
    signer: null, 
    contract: null,
    total: '',
    showConfirm: false,
    showAwait: false,
    willsLength: 0
  };

  componentDidMount = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const network = await provider.getNetwork()
      await provider.send("eth_requestAccounts", []);
      // if (network.chainId !== 31337) {
      //   try {
      //         await window.ethereum.request({
      //           method: 'wallet_switchEthereumChain',
      //           params: [{ chainId: ethers.utils.hexlify(31337) }]
      //         })
      //         .then(() => window.location.reload())
      //       } catch (err) {
      //           // This error code indicates that the chain has not been added to MetaMask
      //         if (err.code === 4902) {
      //           await window.ethereum.request({
      //             method: 'wallet_addEthereumChain',
      //             params: [
      //               {
      //                 chainName: 'Hardhat Test',
      //                 chainId: ethers.utils.hexlify(31337),
      //                 nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
      //                 rpcUrls: ['http://localhost:8545']
      //               }
      //             ]
      //           });
      //         }
      //       }
      // }
      if (network.chainId !== 80001) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(80001) }]
            })
            .then(() => window.location.reload())
          } catch (err) {
              // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainName: 'Mumbai',
                    chainId: ethers.utils.hexlify(5),
                    nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                    rpcUrls: ['https://rpc-mumbai.maticvigil.com']
                  }
                ]
              });
            }
        }
      }
      const signer = await provider.getSigner()
      // token 
      const contract = new ethers.Contract(TheWillAddress, TheWill.abi, signer)

      const wills = await contract.getAllWills((await signer.getAddress()).toString())
      console.log(wills)
      let _total = 0;
      // const hashMessage1 = ethers.utils.solidityKeccak256(["uint256"], [201])
      // const sign1 = await signer.signMessage(ethers.utils.arrayify(hashMessage1));
      // (await contract.queryFilter('AddAnHeir')).forEach(v => _total += parseFloat(ethers.utils.formatEther(v.args.amount.toString())))
      this.setState({
        signer, contract, total: _total, willsLength: wills.length
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    } 
  };

  //new will
  async addNewWill(data) {
    const { contract } = this.state
    // address heir, 
    //     address token,
    //     uint256 timeWhenWithdraw, 
    //     uint256 amount
    await contract.addAnHeir()
  }

  addNewWill = this.addNewWill.bind(this)

  render(){
      return(
        <div className="App">
          <header className="header">
            <div className='header_boxes'>
              <div className="logo-will">
                <img src={logo}/>
              </div>
              <div className="number-of-wills">
                <div className="amount-will">
                <div>
                      Всего завещано:
                  </div>
                  <div>
                      {this.state.total} USD
                  </div>
                </div>
              <Connect/>
            </div>
            </div>
          </header>

            <main>
              {
                this.state.signer === null || this.state.willsLength === 0
                ? 
                <Main/>
                :
                <Data/>
              }
            </main>
        </div>
    );
  }
}

export default App;
