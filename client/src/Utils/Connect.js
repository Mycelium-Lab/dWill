import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import PolygonPic from '../content/poligon.svg'
import BinancePic from '../content/binance.svg'
import EthereumPic from '../content/ethereum.svg'
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { chainIDs, chainRPCURL } from '../Utils/Constants.js'

class Connect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedAddress: localStorage.getItem('account'),
            networkName: 'Mumbai',
            nullProvider: '',
            showWallets: false,
            showNetworks: false
        };
    }

    async connectToMetamask() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner()
            localStorage.setItem('account', accounts[0]);
            localStorage.setItem('wallet', 'Metamask');
            this.setState({ selectedAddress: accounts[0] })
            this.props.setProperties(provider, signer, accounts[0])
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length === 0) {
                  localStorage.removeItem('account')
                  localStorage.removeItem('wallet')
                  this.props.setProperties(null, null, null)
                } else {
                  localStorage.setItem('account', accounts[0])
                  await provider.send("eth_requestAccounts", []);
                  const _signer = provider.getSigner()
                  this.props.setProperties(provider, _signer, accounts[0])
                }
              })
        } catch (error) {
            console.error(error)
        }
    }

    async walletConnect() {
        const provider = new WalletConnectProvider({
            rpc: {80001: "https://rpc-mumbai.maticvigil.com"}
        })

        await provider.enable();

        const _provider = new ethers.providers.Web3Provider(provider)
        // const accounts = await _provider.send("eth_requestAccounts", []);
        const _signer = _provider.getSigner()
        const _address = await _signer.getAddress()
        localStorage.setItem('account', _address);
        localStorage.setItem('wallet', 'WalletConnect');
        this.setState({
            selectedAddress: _address
        })
        this.props.setProperties(_provider, _signer, _address)
    }

    async changeNetwork(chainId) {
        const wallet = localStorage.getItem("wallet")
        if (wallet === 'Metamask') {
            if (chainId === chainIDs.Goerli && chainId !== this.props.network) {
                  try {
                        await window.ethereum.request({
                          method: 'wallet_switchEthereumChain',
                          params: [{ chainId: ethers.utils.hexValue(chainIDs.Goerli) }]
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
                                chainId: ethers.utils.hexValue(chainIDs.Goerli),
                                nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                                rpcUrls: [chainRPCURL.Goerli]
                              }
                            ]
                          });
                        }
                      }
            }
            if (chainId === chainIDs.Mumbai && chainId !== this.props.network) {
                try {
                      await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: ethers.utils.hexValue(chainIDs.Mumbai) }]
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
                              chainId: ethers.utils.hexValue(chainIDs.Mumbai),
                              nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                              rpcUrls: [chainRPCURL.Mumbai]
                            }
                          ]
                        });
                      }
                }
            }
            if (chainId === chainIDs.BinanceTestnet && chainId !== this.props.network) {
                try {
                    console.log(ethers.utils.hexlify(chainIDs.BinanceTestnet))
                      await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: ethers.utils.hexValue(chainIDs.BinanceTestnet) }]
                      })
                      .then(() => window.location.reload())
                } catch (err) {
                        // This error code indicates that the chain has not been added to MetaMask
                      if (err.code === 4902) {
                        await window.ethereum.request({
                          method: 'wallet_addEthereumChain',
                          params: [
                            {
                              chainName: 'Binance Testnet',
                              chainId: ethers.utils.hexValue(chainIDs.BinanceTestnet),
                              nativeCurrency: { name: 'BNB', decimals: 18, symbol: 'BNB' },
                              rpcUrls: [chainRPCURL.BinanceTestnet]
                            }
                          ]
                        });
                      }
                }
            }
        } else if (wallet === 'WalletConnect') {
            alert('You have to change network in your wallet')
        }
    }

    walletConnect = this.walletConnect.bind(this)
    changeNetwork = this.changeNetwork.bind(this)

    showWalletsModal = () => this.setState({showWallets: true})
    closeWalletsModal = () => this.setState({showWallets: false})

    showNetworksModal = () => this.setState({showNetworks: true})
    closeNetworksModal = () => this.setState({showNetworks: false})

    showWalletsModal = this.showWalletsModal.bind(this)
    closeWalletsModal = this.closeWalletsModal.bind(this)

    showNetworksModal = this.showNetworksModal.bind(this)
    closeNetworksModal = this.closeNetworksModal.bind(this)

    renderNetwork(id) {
        if (id !== null) {
            if (id === chainIDs.Mumbai) {
                return (
                    <span>
                        <span>
                            <img src={PolygonPic} alt="Mumbai"/>
                        </span>
                        <span>Mumbai Chain</span>
                    </span>
                )
            } else if (id === chainIDs.Goerli) {
                return (
                    <span>
                        <span>
                            <img src={EthereumPic} alt="Goerli"/>
                        </span>
                        <span>Goerli Chain</span>
                    </span>
                )
            } else if (id === chainIDs.BinanceTestnet) {
                return (
                    <span>
                        <span>
                            <img src={BinancePic} alt="BNBTest Test"/>
                        </span>
                        <span>BNBTest Chain</span>
                    </span>
                )
            } else if (id === chainIDs.Polygon) {
                return (
                    <span>
                        <span>
                            <img src={PolygonPic} alt="Polygon"/>
                        </span>
                        <span>Polygon Chain</span>
                    </span>
                )
            } else if (id === chainIDs.BinanceMainnet) {
                return (
                    <span>
                        <span>
                            <img src={BinancePic} alt="Binance"/>
                        </span>
                        <span>BNB Chain</span>
                    </span>
                )
            } else if (id === chainIDs.EthereumMainnet) {
                return (
                    <span>
                        <span>
                            <img src={EthereumPic} alt="Ethereum"/>
                        </span>
                        <span>Ethereum Chain</span>
                    </span>
                )
            }
        }
    }

    renderNetwork = this.renderNetwork.bind(this)

    renderMetamask() {
        try {
            // if (!window.ethereum) return;
            // const provider = new ethers.providers.Web3Provider(window.ethereum)
            // provider.send("eth_requestAccounts", [])
            //     .then((accounts) => {
            //         localStorage.setItem('account', accounts[0]);
            //     })
            //     .catch((err) => {console.error(err)})
            if (!localStorage.getItem('account')) {
            return (
                <div>
                    <button onClick={this.state.showWallets === false ? this.showWalletsModal : this.closeWalletsModal}>Connect Wallet</button>
                    <Modal show={this.state.showWallets}>
                        <Modal.Header>
                            <h1>Choose wallet:</h1>
                        </Modal.Header>
                        <Modal.Body>
                            <button onClick={() => this.connectToMetamask()}>MetaMask</button>
                            <button onClick={() => this.walletConnect()}>WalletConnect</button>
                        </Modal.Body>
                        <Modal.Footer>
                            <p className='title_trusted-wallet'>What is a wallet?</p>
                            <p className='title_trusted-wallet'>Wallets are used to send, receive, and store digital
                                assets. Connecting a wallet lets you interact with apps.
                                <a href="https://metamask.io/" target="_blank" rel="noreferrer">Install the wallet.</a>
                            </p>
                        </Modal.Footer>
                    </Modal>
                </div>
            )
            } else {
            return (
                <div>
                    <div>
                    {
                        localStorage.getItem('account').slice(0, 6) 
                        + 
                        '...' 
                        + 
                        localStorage.getItem('account').slice(
                            localStorage.getItem('account').length - 4, 
                            localStorage.getItem('account').length
                        )
                    }
                    </div>
                    <div className="btn-header-connect__footer">
                        {
                            this.renderNetwork(this.props.network)
                        }
                        {
                            localStorage.getItem('wallet') === 'WalletConnect'
                            ?
                            null
                            :
                            <button className="btn-change-token" onClick={this.state.showNetworks === false ? this.showNetworksModal : this.closeNetworksModal }>
                                (change)
                            </button>
                        }
                    </div>
                    <Modal className="modal-choose" show={this.state.showNetworks}>
                        <Modal.Header>
                            <h1 className="modal-choose__title">Choose network</h1>
                        </Modal.Header>
                        <Modal.Footer>
                            <img src={PolygonPic} alt="Polygon" onClick={() => this.changeNetwork(chainIDs.Mumbai)}/>
                            <img src={EthereumPic} alt="Ethereum" onClick={() => this.changeNetwork(chainIDs.Goerli)}/>
                            <img src={BinancePic} alt="Binance" onClick={() => this.changeNetwork(chainIDs.BinanceTestnet)}/>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
            }
        } catch (error) {
            console.error(error)
        }
    }

    render() {
            return(
        <div className='btn-header-connect'>
            {this.renderMetamask()}
        </div>
        )
    }
}

export default Connect;