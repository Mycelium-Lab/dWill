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
            showEdit: false,
            showEditTimeWhenWithdraw: false,
            showEditHeir: false,
            currentEditID: '',
            currentEditHeirAddress: '',
            currentEditTimeWhenWithdraw: '',
            network: '',
            approved: false,
            tokensValue: '',
            contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            year: '',
            month: '',
            day: '',
            heirAddress: '',
            contract: null,
            wills: [],
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

    async editTimeWhenWithdraw() {
        try {
            const { currentEditID, contract, year, month, day } = this.state
            const secondsInADay = 86400
            let timeWhenWithdraw = (new Date()).getTime();
            timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000) + year * 365 * secondsInADay + month * 30 * secondsInADay + day * secondsInADay;
            await contract.updateWillTimeWhenWithdraw(currentEditID, timeWhenWithdraw)
                .then(async (tx) => {
                    await tx.wait()
                    this.handleCloseEditTimeWhenWithdraw()
                    this.handleCloseEdit()
                    this.setState({
                        year: '',
                        month: '',
                        day: ''
                    })
                })
        } catch (error) {
            console.error(error)
        }
    }

    async editHeir() {
        try {
            const { currentEditID, contract, heirAddress } = this.state
            await contract.updateAnHeir(currentEditID, heirAddress)
                .then(async (tx) => {
                    await tx.wait()
                    this.handleCloseEditHeir()
                    this.handleCloseEdit()
                })
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

    cancelWill = this.cancelWill.bind(this)
    editTimeWhenWithdraw = this.editTimeWhenWithdraw.bind(this)
    editHeir = this.editHeir.bind(this)

    onChangeYear = this.onChangeYear.bind(this)
    onChangeMonth = this.onChangeMonth.bind(this)
    onChangeDay = this.onChangeDay.bind(this)
    onChangeHeirAddress = this.onChangeHeirAddress.bind(this)

    handleCloseEdit = () => this.setState({
        showEdit: false, currentEditID: '',
        currentEditHeirAddress: '', currentEditTimeWhenWithdraw: ''
    });
    handleShowEdit = (event) => {
        const data = JSON.parse(event.target.value)
        this.setState({
            showEdit: true, 
            currentEditID: data.ID,
            currentEditHeirAddress: data.heir,
            currentEditTimeWhenWithdraw: data.timeWhenWithdraw
        })
    };
    handleCloseEdit = this.handleCloseEdit.bind(this)
    handleShowEdit = this.handleShowEdit.bind(this)

    handleCloseEditTimeWhenWithdraw = () => this.setState({showEditTimeWhenWithdraw: false, showEdit: true})
    handleShowEditTimeWhenWithdraw = () => this.setState({showEditTimeWhenWithdraw: true, showEdit: false})
    handleCloseEditTimeWhenWithdraw = this.handleCloseEditTimeWhenWithdraw.bind(this)
    handleShowEditTimeWhenWithdraw = this.handleShowEditTimeWhenWithdraw.bind(this)

    handleCloseEditHeir = () => this.setState({showEditHeir: false, showEdit: true})
    handleShowEditHeir = () => this.setState({showEditHeir: true, showEdit: false})
    handleCloseEditHeir = this.handleCloseEditHeir.bind(this)
    handleShowEditHeir = this.handleShowEditHeir.bind(this)

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
                                    <button value={JSON.stringify({ID: v.ID.toString(), timeWhenWithdraw: v.timeWhenWithdraw, heir: v.heir})} onClick={this.state.showEdit == false ? this.handleShowEdit : this.handleCloseEdit}>Edit</button>
                                    <button value={v.ID.toString()} onClick={this.cancelWill}>Cancel</button>
                                </li>
                            )
                        })
                    }
                </ul>
                :
                <h4>Empty</h4>
            }
            <Modal show={this.state.showEdit} onHide={this.handleCloseEdit}>
                <Modal.Header>
                    <Modal.Title>Edit Will</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <button onClick={this.handleShowEditTimeWhenWithdraw}>Time When Withdraw</button>
                        <button onClick={this.handleShowEditHeir}>Heir</button>
                    </div>
                </Modal.Body>
                <Button variant="secondary" onClick={this.handleCloseEdit}>
                    Close
                </Button>
            </Modal>
            <Modal show={this.state.showEditTimeWhenWithdraw} onHide={this.handleCloseEditTimeWhenWithdraw}>
                <Modal.Header>
                    <Modal.Title>Time When Withdraw</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div>
                            {this.state.currentEditTimeWhenWithdraw}
                        </div>
                        <div>
                            <input type="number" onChange={this.onChangeYear}/>
                            <label >Лет</label><br/>
                            <input type="number" onChange={this.onChangeMonth}/>
                            <label >Месяцев</label><br/>
                            <input type="number" onChange={this.onChangeDay}/>
                            <label >Дней</label><br/>
                        </div>
                        <button onClick={this.editTimeWhenWithdraw}>Edit</button>
                    </div>
                </Modal.Body>
                <Button variant="secondary" onClick={this.handleCloseEditTimeWhenWithdraw}>
                    Close
                </Button>
            </Modal>
            <Modal show={this.state.showEditHeir} onHide={this.handleCloseEditHeir}>
                <Modal.Header>
                    <Modal.Title>Heir</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div>
                            {this.state.currentEditHeirAddress}
                        </div>
                        <div>
                            Доверенному кошельку
                            <input onChange={this.onChangeHeirAddress}/>
                        </div>
                        <button onClick={this.editHeir}>Edit</button>
                    </div>
                </Modal.Body>
                <Button variant="secondary" onClick={this.handleCloseEditHeir}>
                    Close
                </Button>
            </Modal>
        </div>
        )
    }
}

export default Wills;