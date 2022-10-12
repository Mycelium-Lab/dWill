import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";

import ERC20 from '../Contract/ERC20.json'

class Inheritances extends Component {
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
            inheritances: []
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
            const inheritances = await contract.getAllInheritances(signerAddress)
            let _inheritances = [];
            for (let i = 0; i < inheritances.length; i++) {
                const token = new ethers.Contract(inheritances[i].token, ERC20.abi, signer)
                const symbol = await token.symbol()
                _inheritances[i] = {
                    ID: inheritances[i].ID.toString(),
                    amount: inheritances[i].amount.toString(),
                    done: inheritances[i].done,
                    heir: inheritances[i].heir,
                    owner: inheritances[i].owner,
                    timeWhenWithdraw: inheritances[i].timeWhenWithdraw.toString(),
                    token: inheritances[i].token,
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
            this.setState({ signer, signerAddress, contract, inheritances: _inheritances, network:networkName })
        } catch (error) {
            console.error(error)
        }
    }

    render() {
        return(
        <div>
            <h3>Inheritances</h3>
            {
                this.state.inheritances.length > 0 
                ?
                <ul>
                    {
                        this.state.inheritances.map((v) => {
                            return (
                                <li key={v.ID}>
                                    <div>You can harvest {ethers.utils.formatEther(v.amount)} {v.symbol} from wallet</div>
                                    <div>{v.owner}</div>
                                    <div>on {this.state.network} chain</div>
                                    <button>Claim</button>
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

export default Inheritances;