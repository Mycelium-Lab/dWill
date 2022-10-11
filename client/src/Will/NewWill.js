import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ethers } from "ethers";

import ERC20 from '../Contract/ERC20.json'

class NewWill extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            tokenAddress: '',
            amount: '',
            show: false,
            network: 'Polygon',
            appoved: false,
            tokensValue: '',
            contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        };
    }

    componentDidMount = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const network = await provider.getNetwork()
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()
        this.setState({ signer, signerAddress, network: network.name })
    }

    async approve() {
        const { contractAddress, signer, tokenAddress, amount, tokensValue } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        console.log(amount)
        await _token.increaseAllowance(contractAddress, ethers.utils.parseEther(amount))
    }

    onChangeAmount(event) {
        this.setState({
            amount: event.target.value
        })
    }

    async onChangeTokens(event) {
        try {
            // const { contractAddress, signer, signerAddress, tokenAddress, amount } = this.state
            // const _token = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", ERC20.abi, signer)
            // await _token.allowance(signerAddress, contractAddress)
            //     .then(allowance => {
                    this.setState({
                        tokensValue: event.target.value
                    })
                // })
        } catch (error) {
            console.error(error)
        }
    }

    approve = this.approve.bind(this)
    onChangeTokens = this.onChangeTokens.bind(this)
    onChangeAmount = this.onChangeAmount.bind(this)

    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});

    handleClose = this.handleClose.bind(this)
    handleShow = this.handleShow.bind(this)

    render() {
        return(
        <div>
            <Button variant="primary" onClick={this.handleShow}>
                New Will
            </Button>

            <Modal show={this.state.show} onHide={this.handleClose}>
                <Modal.Header>
                <Modal.Title>New Will</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        Я завещаю мои
                    </div>
                    <select name="tokens" onChange={this.onChangeTokens} value={this.state.tokensValue}>
                        <option value={"select"}>Select</option>
                        <option value={"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"}>TFT</option>
                    </select>
                    <div>
                        На сумму
                        <input onChange={this.onChangeAmount}/>
                    </div>
                    <div>С кошелька {
                        this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)
                        } на сети {this.state.network}</div>
                    <div>
                        {"При условии что я буду неактивен(неактивна) более чем"}
                        <div>
                            <input type="number"/>
                            <label >Лет</label><br/>
                            <input type="number"/>
                            <label >Месяцев</label><br/>
                            <input type="number"/>
                            <label >Дней</label><br/>
                        </div>
                    </div>
                    <div>
                        <input type="checkbox"/>
                        <label >Add NFT Message</label><br/>
                        <input type="checkbox" disabled={true}/>
                        <label >Automatic token delivery (coming soon)</label><br/>
                        <input type="checkbox" disabled={true}/>
                        <label >Notifications (coming soon)</label><br/>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={this.approve}>
                    {this.state.appoved == false ? "Approve": "Make new Will"}
                </Button>
                <Button variant="primary" onClick={this.approve}>
                    {"Make new Will"}
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
        )
    }
}

export default NewWill;