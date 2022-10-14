import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Connect from './Utils/Connect';
import NewWill from './Will/NewWill';
import { Component } from 'react';
import TheWill from './Contract/TheWill.json'

import { ethers } from "ethers";
import Inheritances from './Getters/Inheritances';
import Wills from './Getters/Wills';

class App extends Component {

  state = { 
    signer: null, 
    contract: null,
    total: '',
    showConfirm: false,
    showAwait: false,
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
      if (network.chainId !== 5) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(5) }]
            })
            .then(() => window.location.reload())
          } catch (err) {
              // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainName: 'Goerli',
                    chainId: ethers.utils.hexlify(5),
                    nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                    rpcUrls: ['https://goerli.infura.io/v3']
                  }
                ]
              });
            }
        }
      }
      const signer = provider.getSigner()
      // token 
      const contract = new ethers.Contract('0x034b566d5fF5df8B8cf1c55Cb19814171df8CaA5', TheWill.abi, signer)
      let _total = 0;
      (await contract.queryFilter('AddAnHeir')).forEach(v => _total += parseFloat(ethers.utils.formatEther(v.args.amount.toString())))
      this.setState({
        signer, contract, total: _total
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
              <div>
                TheWill
              </div>
              <div>
                  <div>
                      Всего завещано
                  </div>
                  <div>
                      {this.state.total} USD
                  </div>
              </div>
              <Connect/>
            </div>
          </header>
          <div>
            Reset timers
          </div>
          <div>
            <NewWill addNewWill={this.addNewWill} giveApprove={this.giveApprove}/>
          </div>
          <div>
            <Inheritances/>
          </div>
          <div>
            <Wills/>
          </div>
          
        </div>
    );
  }
}

export default App;
