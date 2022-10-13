import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";

import ERC20 from '../Contract/ERC20.json'

class Wills extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            tokenAddress: '',
            amount: '0',
            show: false,
            network: '',
            approved: false,
            tokensValue: '',
            contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            year: '',
            month: '',
            day: '',
            heirAddress: '',
            contract: null,
            wills: []
        };
    }

    componentDidMount = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const network = await provider.getNetwork()
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner()
            const signerAddress = await signer.getAddress()
            const contract = new ethers.Contract('0x5FbDB2315678afecb367f032d93F642f64180aa3', TheWill.abi, signer)
            const wills = await contract.getAllWills(signerAddress)
            let _wills = [];
            for (let i = 0; i < wills.length; i++) {
                const token = new ethers.Contract(wills[i].token, ERC20.abi, signer)
                const symbol = await token.symbol()
                _wills[i] = {
                    ID: wills[i].ID.toString(),
                    amount: wills[i].amount.toString(),
                    done: wills[i].done,
                    heir: wills[i].heir,
                    owner: wills[i].owner,
                    timeWhenWithdraw: wills[i].timeWhenWithdraw.toString(),
                    token: wills[i].token,
                    symbol
                }
            }
            let networkName
            if (network.chainId === 56) {
                networkName = `BNB Chain`
            } else if (network.chainId === 137) {
                networkName = `Polygon`
            } else if (network.chainId === 31337) {
                networkName = `Hardhat`
            }
            this.setState({ signer, signerAddress, network: networkName, contract, wills: _wills })
            contract.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
                let __wills = this.state.wills
                if (owner == signerAddress) {
                    const will = await contract.inheritanceData(ID.toString())
                    const token = new ethers.Contract(will.token, ERC20.abi, signer)
                    const symbol = await token.symbol()
                    let exist = false
                    for (let i = 0; i < __wills.length; i++) {
                        if (__wills[i].ID === will.ID.toString()) {
                            exist = true
                        }
                    }
                    if (exist == false) {
                        __wills.push({
                            ID: will.ID.toString(),
                            amount: will.amount.toString(),
                            done: will.done,
                            heir: will.heir,
                            owner: will.owner,
                            timeWhenWithdraw: will.timeWhenWithdraw.toString(),
                            token: will.token,
                            symbol
                        })
                    }
                    this.setState({wills: __wills})
                }
            })
            contract.on('Withdraw', async (ID,owner, heir,timeWhenWithdraw) => {
                let __wills = this.state.wills
                if (owner == signerAddress) {
                    __wills = __wills.filter(v => v.ID !== ID.toString())
                    this.setState({wills: __wills})
                }
            })
            contract.on('RemoveWill', async (ID, owner, heir) => {
                let __wills = this.state.wills
                if (owner == signerAddress) {
                    __wills = __wills.filter(v => v.ID !== ID.toString())
                    this.setState({wills: __wills})
                }
            })
        } catch (error) {
            console.error(error)
        }
    }

    async cancelWill(event) {
        try {
            const { contract } = this.state
            await contract.removeWill(event.target.value)
        } catch (error) {
            console.error(error)
        }
    }

    // willsListener = this.willsListener.bind(this)
    cancelWill = this.cancelWill.bind(this)

    render() {
        return(
            <div id='wills'>
            <h3>Wills</h3>
            {
                this.state.wills.length > 0 
                ?
                <ul id='wills-list'>
                    {
                        this.state.wills.map((v) => {
                            return (
                                <li key={v.ID}>
                                    <div>You bequeathed {ethers.utils.formatEther(v.amount)} of your {v.symbol} from {this.state.network} chain to wallet</div>
                                    <div>{v.heir}</div>
                                    <div>Inheritance can be harvest if the period of inactivity is longer than {v.timeWhenWithdraw}</div>
                                    <button value={v.ID.toString()}>Edit</button>
                                    <button value={v.ID.toString()} onClick={this.cancelWill}>Cancel</button>
                                </li>
                            )
                        })
                    }
                </ul>
                :
                <h4>Empty</h4>
            }
        </div>
        )
    }
}

export default Wills;