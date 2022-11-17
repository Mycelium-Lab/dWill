
import { ethers } from "ethers";
import { Component } from 'react';
import axios from 'axios';
import WalletConnectProvider from "@walletconnect/web3-provider";

import './App.css';

import Connect from './Utils/Connect';
import TheWill from './Contract/TheWill.json'
import { chainIDs, chainRPCURL, TheWillAddresses, TokenAddresses } from './Utils/Constants';
import Data from './Data/Data';
import Main from './Main/Main';

import logoWill from './content/logo.svg'

class App extends Component {

  state = { 
    signer: null,
    provider: null,
    signerAddress: null,
    contract: null,
    contractAddress: '',
    tokenAddress: '',
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
      const walletconnect = localStorage.getItem('walletconnect')
      let providerExist = false;
      if (localStorageAccount !== null && (walletType !== null || walletconnect !== null)) {
        if (walletType === 'Metamask') {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const accounts = await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner()
          window.ethereum.on('accountsChanged', async (_accounts) => {
            if (_accounts.length === 0) {
              localStorage.removeItem('account')
              localStorage.removeItem('wallet')
              this.setState({
                provider: null,
                signer: null,
                signerAddress: null
              })
            } else {
              localStorage.setItem('account', _accounts[0])
              await provider.send("eth_requestAccounts", []);
              const _signer = provider.getSigner()
              this.setState({
                signer: _signer,
                signerAddress:_accounts[0]
              })
            }
          })
          localStorage.setItem('account', accounts[0]);
          localStorage.setItem('wallet', 'Metamask');
          providerExist = true
          this.setProperties(provider, signer, accounts[0])
        }
        if (walletType === 'WalletConnect' || walletconnect !== null) {
          const provider = new WalletConnectProvider({
            rpc: {
              80001: chainRPCURL.Mumbai,
              97: chainRPCURL.BinanceTestnet,
              5: chainRPCURL.Goerli,
            }
          })
          await provider.enable();
          const _provider = new ethers.providers.Web3Provider(provider)
          provider.on('accountsChanged', async (__accounts) => {
            if (__accounts.length === 0) {
              localStorage.removeItem('account')
              localStorage.removeItem('wallet')
              this.setState({
                provider: null,
                signer: null,
                signerAddress: null
              })
            } else {
              localStorage.setItem('account', __accounts[0])
              const _signer = _provider.getSigner()
              this.setState({
                signer: _signer,
                signerAddress:__accounts[0]
              })
            }
          })
          provider.on('disconnect', () => {
            localStorage.removeItem('account')
            localStorage.removeItem('wallet')
            localStorage.removeItem('walletconnect')
            this.setState({
              provider: null,
              signer: null,
              signerAddress: null
            })
          })
          provider.on('chainChanged', () => {
            window.location.reload()
          })
          const _signer = _provider.getSigner()
          const _address = await _signer.getAddress()
          localStorage.setItem('account', _address);
          localStorage.setItem('wallet', 'WalletConnect');
          providerExist = true
          this.setProperties(_provider, _signer, _address)
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
    try {
      const network = (await provider.getNetwork()).chainId
      let contractAddress;
      let tokenAddress;
      if (network === chainIDs.Mumbai) {
        contractAddress = TheWillAddresses.Mumbai
        tokenAddress = TokenAddresses.Mumbai
      } else if (network === chainIDs.Goerli) {
        contractAddress = TheWillAddresses.Goerli
        tokenAddress = TokenAddresses.Goerli
      } else if (network === chainIDs.Polygon) {
        contractAddress = TheWillAddresses.Polygon
      } else if (network === chainIDs.BinanceTestnet) {
        contractAddress = TheWillAddresses.BinanceTestnet
        tokenAddress = TokenAddresses.BinanceTestnet
      } else if (network === chainIDs.BinanceMainnet) {
        contractAddress = TheWillAddresses.BinanceMainnet
      } else if (network === chainIDs.EthereumMainnet) {
        contractAddress = TheWillAddresses.EthereumMainnet
      }
      this.setState({
        provider,
        signer,
        signerAddress,
        network,
        contractAddress,
        tokenAddress
      })
    } catch (error) {
      console.error(error)
    }
  }

  setProperties = this.setProperties.bind(this)

  async loadBasic() {
      const { signer, signerAddress, contractAddress } = this.state
      const contract = new ethers.Contract(contractAddress, TheWill.abi, signer)
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
                    <Connect setProperties={this.setProperties} network={this.state.network}/>
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
                  setProperties={this.setProperties}
                  tokenAddress={this.state.tokenAddress}
                  contractAddress={this.state.contractAddress}
                  />
                  :
                  <Data 
                  provider={this.state.provider}
                  signer={this.state.signer}
                  signerAddress={this.state.signerAddress}
                  network={this.state.network}
                  tokenAddress={this.state.tokenAddress}
                  contractAddress={this.state.contractAddress}
                  />
                }
              </main>
          </div>
      );
  }
}

export default App;
