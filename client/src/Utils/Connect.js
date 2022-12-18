import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import PolygonPic from '../content/poligon.svg'
import BinancePic from '../content/binance.svg'
import EthereumPic from '../content/ethereum.svg'
import AvalanchePic from '../content/avalanche.svg'
import OptimismPic from '../content/optimism.svg'
import ArbitrumPic from '../content/arbitrum.svg'
import btnMetamask from '../content/btn-metamask.svg'
import btnWallet from '../content/btn-wallet.svg'
import logoutPic from '../content/logout.svg'
import chengeNetwork from '../content/chenge-network.svg'
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

    componentDidMount() {
        const body = document.getElementsByTagName('body')
        const modalChooseTitle = document.getElementsByClassName('modal-choose__title')
        const modalChoose = document.getElementsByClassName('modal-choose')
        const App = document.getElementsByClassName('App')
        const MainText = document.getElementsByClassName('main-text')
        const HeaderBoxes = document.getElementsByClassName('header_boxes')
        const NumberOfWills = document.getElementsByClassName('number-of-wills')
        const _container = document.getElementsByClassName('_container')
        const blockTwo = document.getElementsByClassName('block-two')
        const blockThree = document.getElementsByClassName('block-three')
        body[0].addEventListener('click', (event) => {
            if (
                this.state.showNetworks === true &&
                event.target.id !== 'change-network' &&
                event.target.id !== 'networkMumbai' &&
                event.target.id !== 'networkGoerli' &&
                event.target.id !== 'networkBinanceTestnet' &&
                event.target.id !== 'networkAvalanche' &&
                event.target.id !== 'networkOptimism' &&
                event.target.id !== 'networkArbitrum' &&
                event.target !== modalChooseTitle[0] &&
                event.target !== modalChoose[0] &&
                event.target.id !== 'change-network-img'
            ) {
                this.closeNetworksModal()
            }
            if (
                this.state.showWallets === true
                &&
                (event.target === App[0]
                    ||
                    event.target === MainText[0]
                    ||
                    event.target === HeaderBoxes[0]
                    ||
                    event.target === NumberOfWills[0]
                    ||
                    event.target === _container[0]
                    ||
                    event.target === blockTwo[0]
                    ||
                    event.target === blockTwo[1]
                    ||
                    event.target === blockThree[0])
            ) {
                this.closeWalletsModal()
            }
        })
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
                .then(() => {
                    window.location.reload()
                })
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
                window.location.reload()
            })
        } catch (error) {
            console.error(error)
        }
    }

    async walletConnect() {
        try {
            const provider = new WalletConnectProvider({
                rpc: {
                    80001: chainRPCURL.Mumbai,
                    97: chainRPCURL.BinanceTestnet,
                    5: chainRPCURL.Goerli,
                    137: chainRPCURL.Polygon,
                    56: chainRPCURL.BinanceMainnet,
                    1: chainRPCURL.EthereumMainnet,
                    42161: chainRPCURL.ArbitrumMainnet,
                    43114: chainRPCURL.AvalancheMainnet,
                    10: chainRPCURL.OptimismMainnet
                }
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
                .then(() => {
                    window.location.reload()
                })
        } catch (error) {
            console.error(error)
        }
    }

    async _changeNetwork(chainId, name, symbol, rpc) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ethers.utils.hexValue(chainId) }]
            })
                .then(() => window.location.reload())
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName: name,
                            chainId: ethers.utils.hexValue(chainId),
                            nativeCurrency: { name: symbol, decimals: 18, symbol },
                            rpcUrls: [rpc]
                        }
                    ]
                });
            }
        }
    }

    async _changeNetworkWalletConnect(provider, chainId, name, symbol, rpc) {
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ethers.utils.hexValue(chainId) }]
            })
                .then(() => window.location.reload())
        } catch (error) {
            if (error.message.includes('Try adding the chain using wallet_addEthereumChain first')) {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName: name,
                            chainId: ethers.utils.hexValue(chainId),
                            nativeCurrency: { name: symbol, decimals: 18, symbol },
                            rpcUrls: [rpc]
                        }
                    ]
                });
            }
        }
    }

    async changeNetwork(chainId) {
        const wallet = localStorage.getItem("wallet")
        if (wallet === 'Metamask') {
            if (chainId === chainIDs.Goerli && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.Goerli, 'Goerli', 'ETH', chainRPCURL.Goerli)
            }
            if (chainId === chainIDs.Mumbai && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.Mumbai, 'Mumbai', 'MATIC', chainRPCURL.Mumbai)
            }
            if (chainId === chainIDs.BinanceTestnet && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.BinanceTestnet, 'Binance Testnet', 'BNB', chainRPCURL.BinanceTestnet)
            }
            if (chainId === chainIDs.EthereumMainnet && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.EthereumMainnet, 'Ethereum', 'ETH', chainRPCURL.EthereumMainnet)
            }
            if (chainId === chainIDs.Polygon && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.Polygon, 'Polygon', 'MATIC', chainRPCURL.Polygon)
            }
            if (chainId === chainIDs.BinanceMainnet && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.BinanceMainnet, 'BNB', 'BNB', chainRPCURL.BinanceMainnet)
            }
            if (chainId === chainIDs.AvalancheMainnet && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.AvalancheMainnet, 'Avalanche', 'AVAX', chainRPCURL.AvalancheMainnet)
            }
            if (chainId === chainIDs.OptimismMainnet && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.OptimismMainnet, 'Optimism', 'ETH', chainRPCURL.OptimismMainnet)
            }
            if (chainId === chainIDs.ArbitrumMainnet && chainId !== this.props.network) {
                await this._changeNetwork(chainIDs.ArbitrumMainnet, 'Arbitrum', 'ETH', chainRPCURL.ArbitrumMainnet)
            }
        } else if (wallet === 'WalletConnect') {
            const provider = new WalletConnectProvider({
                rpc: {
                    80001: chainRPCURL.Mumbai,
                    97: chainRPCURL.BinanceTestnet,
                    5: chainRPCURL.Goerli,
                    137: chainRPCURL.Polygon,
                    56: chainRPCURL.BinanceMainnet,
                    1: chainRPCURL.EthereumMainnet,
                    42161: chainRPCURL.ArbitrumMainnet,
                    43114: chainRPCURL.AvalancheMainnet,
                    10: chainRPCURL.OptimismMainnet
                  }
            })
            await provider.enable();
            if (chainId === chainIDs.Goerli && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.Goerli, 'Goerli', 'ETH', chainRPCURL.Goerli)
            }
            if (chainId === chainIDs.Mumbai && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.Mumbai, 'Mumbai', 'MATIC', chainRPCURL.Mumbai)
            }
            if (chainId === chainIDs.BinanceTestnet && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.BinanceTestnet, 'Binance Testnet', 'BNB', chainRPCURL.BinanceTestnet)
            }
            if (chainId === chainIDs.EthereumMainnet && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.EthereumMainnet, 'Ethereum', 'ETH', chainRPCURL.EthereumMainnet)
            }
            if (chainId === chainIDs.Polygon && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.Polygon, 'Polygon', 'MATIC', chainRPCURL.Polygon)
            }
            if (chainId === chainIDs.BinanceMainnet && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.BinanceMainnet, 'BNB', 'BNB', chainRPCURL.BinanceMainnet)
            }
            if (chainId === chainIDs.AvalancheMainnet && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.AvalancheMainnet, 'Avalanche', 'AVAX', chainRPCURL.AvalancheMainnet)
            }
            if (chainId === chainIDs.OptimismMainnet && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.OptimismMainnet, 'Optimism', 'ETH', chainRPCURL.OptimismMainnet)
            }
            if (chainId === chainIDs.ArbitrumMainnet && chainId !== this.props.network) {
                await this._changeNetworkWalletConnect(provider, chainIDs.ArbitrumMainnet, 'Arbitrum', 'ETH', chainRPCURL.ArbitrumMainnet)
            }
        }
    }

    async logout() {
        try {
            const wallet = localStorage.getItem('wallet')
            if (wallet === 'WalletConnect') {
                const provider = new WalletConnectProvider({
                    rpc: {
                        80001: chainRPCURL.Mumbai,
                        97: chainRPCURL.BinanceTestnet,
                        5: chainRPCURL.Goerli,
                        137: chainRPCURL.Polygon,
                        56: chainRPCURL.BinanceMainnet,
                        1: chainRPCURL.EthereumMainnet,
                        42161: chainRPCURL.ArbitrumMainnet,
                        43114: chainRPCURL.AvalancheMainnet,
                        10: chainRPCURL.OptimismMainnet
                      }
                })
                await provider.enable();
                await provider.disconnect()

                localStorage.removeItem('account')
                localStorage.removeItem('wallet')
                localStorage.removeItem('walletconnect')
                this.props.setProperties(null, null, null)
            } else {
                localStorage.removeItem('account')
                localStorage.removeItem('wallet')
                this.props.setProperties(null, null, null)
            }
        } catch (error) {
            console.log(error)
        }
    }

    logout = this.logout.bind(this)

    walletConnect = this.walletConnect.bind(this)
    changeNetwork = this.changeNetwork.bind(this)

    showWalletsModal = () => this.setState({ showWallets: true })
    closeWalletsModal = () => this.setState({ showWallets: false })

    showNetworksModal = () => {
        this.setState({ showNetworks: true })
    }
    closeNetworksModal = () => {
        this.setState({ showNetworks: false })
    }

    showWalletsModal = this.showWalletsModal.bind(this)
    closeWalletsModal = this.closeWalletsModal.bind(this)

    showNetworksModal = this.showNetworksModal.bind(this)
    closeNetworksModal = this.closeNetworksModal.bind(this)

    showLogoutBtn = () => this.setState({ showLogout: true })
    closeLogoutBtn = () => this.setState({ showLogout: false })

    showLogoutBtn = () => this.showLogoutBtn.bind(this)
    closeLogoutBtn = () => this.closeLogoutBtn.bind(this)

    _renderNetwork(pic, name) {
        return (
            <span>
                <span>
                    <img src={pic} alt={name} />
                </span>
                <span>{name} Chain</span>
            </span>
        )
    }

    renderNetwork(id) {
        if (id !== null) {
            if (id === chainIDs.Mumbai) {
                return this._renderNetwork(PolygonPic, 'Mumbai')
            } else if (id === chainIDs.Goerli) {
                return this._renderNetwork(EthereumPic, 'Goerli')
            } else if (id === chainIDs.BinanceTestnet) {
                return this._renderNetwork(BinancePic, 'BNBTest Test')
            } else if (id === chainIDs.Polygon) {
                return this._renderNetwork(PolygonPic, 'Polygon')
            } else if (id === chainIDs.BinanceMainnet) {
                return this._renderNetwork(BinancePic, 'BNB')
            } else if (id === chainIDs.EthereumMainnet) {
                return this._renderNetwork(EthereumPic, 'Ethereum')
            } else if (id === chainIDs.AvalancheMainnet) {
                return this._renderNetwork(AvalanchePic, 'Avalanche')
            } else if (id === chainIDs.OptimismMainnet) {
                return this._renderNetwork(OptimismPic, 'Optimism')
            } else if (id === chainIDs.ArbitrumMainnet) {
                return this._renderNetwork(ArbitrumPic, 'Arbitrum')
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
                        <button id='connect-button' onClick={this.state.showWallets === false ? this.showWalletsModal : this.closeWalletsModal}>Connect Wallet</button>
                        <Modal className="modal-choose-wallet" show={this.state.showWallets}>
                            <Modal.Header>
                                <h1>Choose wallet</h1>
                            </Modal.Header>
                            <Modal.Body>
                                <button onClick={() => this.connectToMetamask()}><img src={btnMetamask}></img></button>
                                <button onClick={() => this.walletConnect()}><img src={btnWallet}></img></button>
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
                        <div className="btn-header__main">
                            <div>
                                <div className="btn-header__wallet">
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
                                </div>
                            </div>
                            {
                                    <button id='change-network' className="btn-change-token" onClick={this.state.showNetworks === false ? this.showNetworksModal : this.closeNetworksModal}>
                                        {/* (change) */}
                                        <img id='change-network-img' src={chengeNetwork}></img>
                                    </button>
                            }
                            <div className="btn-header__logout">
                                <button onClick={this.logout}><img src={logoutPic} alt="logout"></img></button>
                            </div>
                        </div>

                        <Modal className="modal-choose" show={this.state.showNetworks}>
                            <Modal.Header>
                                <h1 className="modal-choose__title">Choose network</h1>
                            </Modal.Header>
                            <Modal.Footer>
                                <img id='networkMumbai' src={PolygonPic} alt="Polygon" onClick={() => this.changeNetwork(chainIDs.Polygon)} className={
                                    this.props.network === chainIDs.Polygon ? "chosen-network" : ""
                                } />
                                <img id='networkGoerli' src={EthereumPic} alt="Ethereum" onClick={() => this.changeNetwork(chainIDs.EthereumMainnet)} className={
                                    this.props.network === chainIDs.EthereumMainnet ? "chosen-network" : ""
                                } />
                                <img id='networkBinanceTestnet' src={BinancePic} alt="Binance" onClick={() => this.changeNetwork(chainIDs.BinanceMainnet)} className={
                                    this.props.network === chainIDs.BinanceMainnet ? "chosen-network" : ""
                                } />
                                <img id='networkAvalanche' src={AvalanchePic} alt="Avalanche" onClick={() => this.changeNetwork(chainIDs.AvalancheMainnet)} className={
                                    this.props.network === chainIDs.AvalancheMainnet ? "chosen-network" : ""
                                } />
                                <img id='networkOptimism' src={OptimismPic} alt="Optimism" onClick={() => this.changeNetwork(chainIDs.OptimismMainnet)} className={
                                    this.props.network === chainIDs.OptimismMainnet ? "chosen-network" : ""
                                } />
                                <img id='networkArbitrum' src={ArbitrumPic} alt="Arbitrum" onClick={() => this.changeNetwork(chainIDs.ArbitrumMainnet)} className={
                                    this.props.network === chainIDs.ArbitrumMainnet ? "chosen-network" : ""
                                } />
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
        return (
            <div className='btn-header-connect'>
                {this.renderMetamask()}
            </div>
        )
    }
}

export default Connect;