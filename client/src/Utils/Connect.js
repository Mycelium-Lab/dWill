import React, { Component } from 'react';

import { ethers } from "ethers";
import Button from 'react-bootstrap/esm/Button';

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
            if (accounts.length == 0) {
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
            localStorage.setItem('account', accounts[0]);
            this.setState({ selectedAddress: accounts[0] })
        } catch (error) {
            console.error(error)
        }
    }

    renderMetamask() {
        try {
            if (!window.ethereum) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            provider.send("eth_requestAccounts", [])
                .then((accounts) => {
                    localStorage.setItem('account', accounts[0]);
                })
                .catch((err) => {console.error(err)})
            window.ethereum.on("accountsChanged", this.disconnect)
            if (!this.state.selectedAddress) {
            return (
                <button onClick={() => this.connectToMetamask()}>Connect</button>
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
                    </div>
                    <div>
                        <span>{this.state.networkName} Chain </span>
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