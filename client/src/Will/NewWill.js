import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";

import ERC20 from '../Contract/ERC20.json'

class NewWill extends Component {
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
            contract: null
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
            let networkName
            if (network.chainId === 56) {
                networkName = `BNB Chain`
            } else if (network.chainId === 137) {
                networkName = `Polygon`
            } else if (network.chainId === 31337) {
                networkName = `Hardhat`
            }
            this.setState({ signer, signerAddress, network: networkName, contract })
        } catch (error) {
            console.error(error)
        }
    }

    async approve() {
        const { contractAddress, signer, amount, tokensValue } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        await _token.increaseAllowance(contractAddress, ethers.utils.parseEther(amount))
            .then(async (tx) => {
                await tx.wait()
                .then(() => {
                    this.setState({
                        approved: true
                    })
                })
            })
            .catch(err => console.error(err))
    }

    async newWill() {
        try {
            const { contract, heirAddress, amount, tokensValue, year, month, day } = this.state
            const secondsInADay = 86400
            let timeWhenWithdraw = (new Date()).getTime();
            timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000) + year * 365 * secondsInADay + month * 30 * secondsInADay + day * secondsInADay;
            await contract.addNewWill(heirAddress, tokensValue, timeWhenWithdraw, ethers.utils.parseEther(amount))
        } catch (error) {
            console.error(error)
        }
    }

    async onChangeAmount(event) {
        try {
            const { contractAddress, signer, signerAddress, tokensValue, amount } = this.state
            this.setState({
                amount: event.target.value
            })
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            const allowance = (await _token.allowance(signerAddress, contractAddress)).toString()
            this.changeApproved(allowance, event.target.value)
        } catch (error) {
            console.error(error)
        }
    }

    changeApproved(allowance, amount) {
        try {
            if (parseInt(allowance) >= parseInt(ethers.utils.parseEther(amount)) && parseInt(allowance) !== 0) {
                this.setState({
                    approved: true
                })
            } else {
                this.setState({
                    approved: false
                })
            }
        } catch (error) {
            console.error(error.reason)
        }
    }

    async onChangeTokens(event) {
        try {
            const { contractAddress, signer, signerAddress, tokenAddress, amount } = this.state
            const _token = new ethers.Contract(event.target.value, ERC20.abi, signer)
            this.setState({
                tokensValue: event.target.value
            })
            const allowance = (await _token.allowance(signerAddress, contractAddress)).toString()
            this.changeApproved(allowance, amount)
        } catch (error) {
            console.error(error)
        }
    }

    onChangeYear(event) {
        this.setState({
            year: event.target.value
        })
    }

    onChangeMonth(event) {
        this.setState({
            month: event.target.value
        })
    }

    onChangeDay(event) {
        this.setState({
            day: event.target.value
        })
    }

    onChangeHeirAddress(event) {
        this.setState({
            heirAddress: event.target.value
        })
    }

    approve = this.approve.bind(this)
    newWill = this.newWill.bind(this)
    onChangeTokens = this.onChangeTokens.bind(this)
    onChangeAmount = this.onChangeAmount.bind(this)
    changeApproved = this.changeApproved.bind(this)
    onChangeYear = this.onChangeYear.bind(this)
    onChangeMonth = this.onChangeMonth.bind(this)
    onChangeDay = this.onChangeDay.bind(this)
    onChangeHeirAddress = this.onChangeHeirAddress.bind(this)

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
                        Доверенному кошельку
                        <input onChange={this.onChangeHeirAddress}/>
                    </div>
                    <div>
                        {"При условии что я буду неактивен(неактивна) более чем"}
                        <div>
                            <input type="number" onChange={this.onChangeYear}/>
                            <label >Лет</label><br/>
                            <input type="number" onChange={this.onChangeMonth}/>
                            <label >Месяцев</label><br/>
                            <input type="number" onChange={this.onChangeDay}/>
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
                <Button variant="primary" onClick={this.state.approved == false ? this.approve : this.newWill}>
                    {this.state.approved == false ? "Approve": "Make new Will"}
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
        )
    }
}

export default NewWill;