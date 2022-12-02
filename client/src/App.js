
import { ethers } from "ethers";
import { Component } from 'react';
import axios from 'axios';
import WalletConnectProvider from "@walletconnect/web3-provider";

import './App.css';
import PolygonPic from './content/poligon.svg'
import BinancePic from './content/binance.svg'
import EthereumPic from './content/ethereum.svg'
import AvalanchePic from './content/avalanche.svg'
import OptimismPic from './content/optimism.svg'
import ArbitrumPic from './content/arbitrum.svg'
import discordLogo from './content/DiscordLogo.svg'
import twitterLogo from './content/TwitterLogo.svg'
import telegramLogo from './content/TelegramLogo.svg'
import Connect from './Utils/Connect';
import TheWill from './Contract/TheWill.json'
import { chainIDs, chainRPCURL, NetworkProviders, TheWillAddresses, TokenAddresses } from './Utils/Constants';
import Data from './Data/Data';
import Main from './Main/Main';

import logoWill from './content/logo.svg'
import { renderStars } from "./Utils/stars";

class App extends Component {

  state = {
    signer: null,
    provider: null,
    signerAddress: null,
    contract: null,
    contractAddress: '',
    tokenAddress: '',
    network: null,
    networkProvider: '',
    networkName: null,
    networkPic: null,
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
                signerAddress: _accounts[0]
              })
            }
            window.location.reload()
          })
          window.ethereum.on('chainChanged', () => {
            window.location.reload()
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
              localStorage.removeItem('walletconnect')
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
                signerAddress: __accounts[0]
              })
            }
            window.location.reload()
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
            total: this.numberWithSpaces(response.data)
          })
        })
      setInterval(() => {
        axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
          .then(response => {
            this.setState({
              total: this.numberWithSpaces(response.data)
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

    

    renderStars()

    // function canvas() {
    //   const cnv = document.querySelector('#cnv');
    //   //Get context and screen size;
    //   var ctx = cnv.getContext("2d");
    //   var W = window.innerWidth;
    //   var H = window.innerHeight;

    //   //Set Canvas and Background Color;
    //   cnv.width = W;
    //   cnv.height = H;
    //   ctx.fillStyle = "#112";
    //   ctx.fillRect(0, 0, W, H);

    //   //Glow effect;
    //   ctx.shadowBlur = 10;
    //   ctx.shadowColor = "white";

    //   function animate() {
    //     //Random position and size of stars;
    //     let x = W * Math.random();
    //     let y = H * Math.random();
    //     let r = 2.5 * Math.random();

    //     //Draw the stars;
    //     ctx.beginPath();
    //     ctx.fillStyle = "white";
    //     ctx.arc(x, y, r, 0, Math.PI * 2);
    //     ctx.fill();

    //     //Using setTimeout instead of window.requestAnimationFrame for slower speed... window.requestAnimationFrame is approximately equal to setTimeout(func, 17);
    //     setTimeout(animate, 100);
    //   }
    //   animate();

    // }
    // canvas();
  };

  numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  async setProperties(provider, signer, signerAddress) {
    try {
      const network = (await provider.getNetwork()).chainId
      let contractAddress;
      let tokenAddress;
      let networkProvider;
      let networkPicture;
      let networkName;
      if (network === chainIDs.Mumbai) {
        contractAddress = TheWillAddresses.Mumbai
        tokenAddress = TokenAddresses.Mumbai
        networkProvider = NetworkProviders.Mumbai
        networkPicture = PolygonPic
        networkName = 'Mumbai'
      } else if (network === chainIDs.Goerli) {
        contractAddress = TheWillAddresses.Goerli
        tokenAddress = TokenAddresses.Goerli
        networkProvider = NetworkProviders.Goerli
        networkPicture = EthereumPic
        networkName = 'Goerli'
      } else if (network === chainIDs.Polygon) {
        contractAddress = TheWillAddresses.Polygon
        networkProvider = NetworkProviders.Polygon
        networkPicture = PolygonPic
        networkName = 'Polygon'
      } else if (network === chainIDs.BinanceTestnet) {
        contractAddress = TheWillAddresses.BinanceTestnet
        tokenAddress = TokenAddresses.BinanceTestnet
        networkProvider = NetworkProviders.BinanceTestnet
        networkPicture = BinancePic
        networkName = 'BNB Test'
      } else if (network === chainIDs.BinanceMainnet) {
        contractAddress = TheWillAddresses.BinanceMainnet
        networkProvider = NetworkProviders.BinanceMainnet
        networkPicture = BinancePic
        networkName = 'BNB'
      } else if (network === chainIDs.EthereumMainnet) {
        contractAddress = TheWillAddresses.EthereumMainnet
        networkProvider = NetworkProviders.EthereumMainnet
        networkPicture = EthereumPic
        networkName = 'Ethereum'
      } else if (network === chainIDs.AvalancheMainnet) {
        contractAddress = ''
        networkProvider = NetworkProviders.AvalancheMainnet
        networkPicture = AvalanchePic
        networkName = 'Avalance'
      } else if (network === chainIDs.OptimismMainnet) {
        contractAddress = ''
        networkProvider = NetworkProviders.OptimismMainnet
        networkPicture = OptimismPic
        networkName = 'Optimism'
      } else if (network === chainIDs.ArbitrumMainnet) {
        contractAddress = ''
        networkProvider = NetworkProviders.ArbitrumMainnet
        networkPicture = ArbitrumPic
        networkName = 'Arbitrum'
      }
      this.setState({
        provider,
        signer,
        signerAddress,
        network,
        contractAddress,
        tokenAddress,
        networkProvider,
        networkPic: networkPicture,
        networkName
      })
    } catch (error) {
      if (provider === null && signer === null && signerAddress === null) {
        this.setState({
          provider,
          signer,
          signerAddress
        })
      }
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
      if (owner.toLowerCase() === signerAddress.toLowerCase()) {
        this.setState({
          willsLength: this.state.willsLength + 1
        })
      }
      setTimeout(async () => {
        axios.get('https://docs.google.com/spreadsheets/d/1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac/gviz/tq?tqx=out:csv&tq=SELECT *')
          .then(response => {
            this.setState({
              total: this.numberWithSpaces(response.data)
            })
          })
      }, 5000)
    })
    this.setState({
      contract, willsLength: wills.length, inheritancesLength: inheritances.length
    })
  }

  loadBasic = this.loadBasic.bind(this)

  render() {
    return (
      <div className="App">
          <canvas id="space"></canvas>
        <header className="header _container">
          <div className='header_boxes'>
            <div className="header_boxes-col">
              <a href="/" className="logo-will">
                <span>dWILL</span>
              </a>
              <div className="amount-will">
                <div>
                  Total bequeathed via dWill:
                </div>
                <div>
                  {this.state.total} USD
                </div>
              </div>
            </div>

            {
              <Connect
                setProperties={this.setProperties}
                network={this.state.network}
                networkName={this.state.networkName}
                networkPic={this.state.networkPic}
              />
            }

          </div>
        </header>

        <main className="_container">
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
                networkProvider={this.state.networkProvider}
                networkName={this.state.networkName}
              />
              :
              <Data
                provider={this.state.provider}
                signer={this.state.signer}
                signerAddress={this.state.signerAddress}
                network={this.state.network}
                tokenAddress={this.state.tokenAddress}
                contractAddress={this.state.contractAddress}
                networkProvider={this.state.networkProvider}
                networkName={this.state.networkName}
              />
          }
        </main>
        <footer className="footer">
          <div class="footer__wrapper _container">
            <div className="footer__social">
              <a href="" target="_blank">
                <img src={discordLogo}></img>
              </a>
              <a href="" target="_blank">
                <img src={twitterLogo}></img>
              </a>
              <a href="" target="_blank">
                <img src={telegramLogo}></img>
              </a>
            </div>
            <a className="footer__copy">
              support@dwill.app
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
