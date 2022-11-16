
import { ethers } from "ethers";
import { Component } from 'react';
import axios from 'axios';
import WalletConnectProvider from "@walletconnect/web3-provider";

import './App.css';


import Connect from './Utils/Connect';
import TheWill from './Contract/TheWill.json'
import { TheWillAddress } from './Utils/Constants';
import Data from './Data/Data';
import Main from './Main/Main';

import logoWill from './content/logo.svg'

class App extends Component {

  state = { 
    signer: null,
    provider: null,
    signerAddress: null,
    contract: null,
    network: null,
    total: '',
    showConfirm: false,
    showAwait: false,
    willsLength: 0,
    inheritancesLength: 0
  };

  componentDidMount = async () => {
    try {
      const localStorageAccount = localStorage.getItem('account')
      const walletType = localStorage.getItem('wallet')
      let providerExist = false;
      if (localStorageAccount !== null && walletType !== null) {
        if (walletType === 'Metamask') {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const accounts = await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner()
          const network = (await provider.getNetwork()).chainId
          localStorage.setItem('account', accounts[0]);
          providerExist = true
          this.setState({
            provider,
            signer,
            signerAddress:accounts[0],
            network
          })
        }
        if (walletType === 'WalletConnect') {
          const provider = new WalletConnectProvider({
            rpc: {80001: "https://rpc-mumbai.maticvigil.com"}
          })
          await provider.enable();
          const _provider = new ethers.providers.Web3Provider(provider)
          const _signer = _provider.getSigner()
          const _address = await _signer.getAddress()
          const network = (await _provider.getNetwork()).chainId
          localStorage.setItem('account', _address);
          providerExist = true
          this.setState({
            provider:_provider,
            signer:_signer,
            signerAddress:_address,
            network
          })
        }
      }
      axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
        .then(response => {
          this.setState({
            total: response.data
          })
        })
      setInterval(() => {
        axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
        .then(response => {
          this.setState({
            total: response.data
          })
        })
      }, 5000)
      if (providerExist === true) {
        setTimeout(async () => {
          await this.loadBasic()
        }, 100)
      }
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    } 
  };

  async setProperties(provider, signer, signerAddress) {
    this.setState({
      provider,
      signer,
      signerAddress
    })
  }

  setProperties = this.setProperties.bind(this)

  async loadBasic() {
      const { signer, signerAddress } = this.state
      const contract = new ethers.Contract(TheWillAddress, TheWill.abi, signer)
      const wills = await contract.getAllWills(signerAddress)
      const inheritances = await contract.getAllInheritances(signerAddress)
      contract.on('AddAnHeir', async (ID, owner, heir, token, timeWhenWithdraw, amount) => {
        if (owner === signerAddress) {
          this.setState({
            willsLength: this.state.willsLength + 1
          })
        }
        setTimeout(async () => {
          axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
          .then(response => {
            this.setState({
              total: response.data
            })
          })
        }, 5000)
      })
      this.setState({
        contract, willsLength: wills.length, inheritancesLength: inheritances.length
      })
  }

  loadBasic = this.loadBasic.bind(this)

  render(){
        return(
          <div className="App">
            <header className="header">
              <div className='header_boxes'>
                <div className="logo-will">
                  <img src={logoWill} alt='logowill'/>
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
                  {
                    !window.ethereum
                    ?
                    null
                    :
                    <Connect setProperties={this.setProperties}/>
                  }
              </div>
              </div>
            </header>
  
              <main>
                {
                  this.state.signer === null || this.state.willsLength === 0
                  ? 
                  <Main 
                  inheritancesLength={this.state.inheritancesLength} 
                  willsLength={this.state.willsLength}
                  provider={this.state.provider}
                  signer={this.state.signer}
                  signerAddress={this.state.signerAddress}
                  network={this.state.network}
                  />
                  :
                  <Data 
                  provider={this.state.provider}
                  signer={this.state.signer}
                  signerAddress={this.state.signerAddress}
                  network={this.state.network}
                  />
                }
              </main>
          </div>
      );
  }
}

export default App;
