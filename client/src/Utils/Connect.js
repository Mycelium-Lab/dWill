import React, { Component } from 'react';

import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

class Connect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedAddress: localStorage.getItem('account'),
            networkName: 'Mumbai',
            nullProvider: ''
        };
    }

    async disconnect(accounts) {
        try {
            if (accounts.length === 0) {
                localStorage.removeItem('account');
                this.setState({ selectedAddress: null })
                this.props.disconnect(null)
            } else {
                localStorage.setItem('account', accounts[0]);
                this.setState({ selectedAddress: accounts[0] })
                this.props.disconnect(accounts[0])
            }
        } catch (error) {
            console.error(error)
        }
    }

    disconnect = this.disconnect.bind(this)

    async connectToMetamask() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner()
            localStorage.setItem('account', accounts[0]);
            localStorage.setItem('wallet', 'Metamask');
            this.setState({ selectedAddress: accounts[0] })
            this.props.setProperties(provider, signer, accounts[0])
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

    walletConnect = this.walletConnect.bind(this)

    renderMetamask() {
        try {
            // if (!window.ethereum) return;
            // const provider = new ethers.providers.Web3Provider(window.ethereum)
            // provider.send("eth_requestAccounts", [])
            //     .then((accounts) => {
            //         localStorage.setItem('account', accounts[0]);
            //     })
            //     .catch((err) => {console.error(err)})
            // window.ethereum.on("accountsChanged", this.disconnect)
            if (!this.state.selectedAddress) {
            return (
                <div>
                    <button onClick={() => this.connectToMetamask()}>MetaMask</button>
                    <button onClick={() => this.walletConnect()}>WalletConnect</button>
                </div>
            )
            } else {
            return (
                <div>
                    <div>
                    {
                        this.state.selectedAddress.slice(0, 6) 
                        + 
                        '...' 
                        + 
                        this.state.selectedAddress.slice(
                            this.state.selectedAddress.length - 4, 
                            this.state.selectedAddress.length
                        )
                    }
                    {/* </div> 
                    <div>
                    <img src="./content/buttom-metamask.svg"/> 
                    </div>
                    <div>
                    <img scr="./content/button-m.svg"/> 
                    </div> */}
                </div>
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