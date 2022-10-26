import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";

import ERC20 from '../Contract/ERC20.json'
import { TheWillAddress, TokenAddress } from '../Utils/Constants';

class Wills extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            tokenAddress: '',
            amount: '0',
            showConfirm: false,
            showAwait: false,
            showEdit: false,
            showEditTimeWhenWithdraw: false,
            showEditHeir: false,
            currentEditID: '',
            currentEditHeirAddress: '',
            currentEditTimeWhenWithdraw: '',
            network: '',
            approved: false,
            tokensValue: '',
            contractAddress: TheWillAddress,
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
            const contract = new ethers.Contract(TheWillAddress, TheWill.abi, signer)
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
            } else if (network.chainId === 80001) {
                networkName = `Mumbai`
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

    timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var year = a.getFullYear();
        var month = a.getMonth();
        var date = a.getDate();
        var time = `${date < 10 ? '0'+ date : date}` + '.' + `${month < 10 ? '0' + month : month}` + '.' + year;
        return time;
    }

    async cancelWill(event) {
        try {
            const { contract } = this.state
            this.handleShowConfirm()
            await contract.removeWill(event.target.value)
                .then(async (tx) => {
                    this.handleShowAwait()
                    await tx.wait()
                    this.handleCloseAwait()
                })
        } catch (error) {
            console.error(error)
            this.handleCloseConfirm()
            this.handleCloseAwait()
        }
    }

    async editTimeWhenWithdraw() {
        try {
            const { currentEditID, contract, year, month, day } = this.state
            const secondsInADay = 86400
            let timeWhenWithdraw = (new Date()).getTime();
            timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000) + year * 365 * secondsInADay + month * 30 * secondsInADay + day * secondsInADay;
            this.handleShowConfirm()
            await contract.updateWillTimeWhenWithdraw(currentEditID, timeWhenWithdraw)
                .then(async (tx) => {
                    this.handleShowAwait()
                    await tx.wait()
                    this.handleCloseAwait()
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
            this.handleCloseConfirm()
            this.handleCloseAwait()
        }
    }

    async editHeir() {
        try {
            const { currentEditID, contract, heirAddress } = this.state
            this.handleShowConfirm()
            await contract.updateAnHeir(currentEditID, heirAddress)
                .then(async (tx) => {
                    this.handleShowAwait()
                    await tx.wait()
                    this.handleCloseAwait()
                    this.handleCloseEditHeir()
                    this.handleCloseEdit()
                })
        } catch (error) {
            console.error(error)
            this.handleCloseConfirm()
            this.handleCloseAwait()
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

    onChangeTokens = this.onChangeTokens.bind(this)
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

    handleShowConfirm = () => this.setState({showConfirm: true})
    handleShowAwait = () => this.setState({showConfirm: false, showAwait: true})
    handleCloseConfirm = () => this.setState({showConfirm: false})
    handleCloseAwait = () => this.setState({showAwait: false})
    handleShowConfirm = this.handleShowConfirm.bind(this)
    handleShowAwait = this.handleShowAwait.bind(this)
    handleCloseConfirm = this.handleCloseConfirm.bind(this)
    handleCloseAwait = this.handleCloseAwait.bind(this)

    timeConverter = this.timeConverter.bind(this)

    render() {
        return(
            <div id='wills'>
            <h3>Your wills</h3>
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
                                    <div>Inheritance can be harvest if the period of inactivity is longer than {this.timeConverter(v.timeWhenWithdraw)}</div>
                                    <button type="button" className="btn btn-success" value={JSON.stringify({ID: v.ID.toString(), timeWhenWithdraw: v.timeWhenWithdraw, heir: v.heir})} onClick={this.state.showEdit == false ? this.handleShowEdit : this.handleCloseEdit}>Edit</button>
                                    <button type="button" className="btn btn-danger" value={v.ID.toString()} onClick={this.cancelWill}>Cancel</button>
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
                <Modal.Title>New Will</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        Я завещаю мои
                    </div>
                    <select className="form-select" name="tokens" onChange={this.onChangeTokens} value={this.state.tokensValue}>
                        <option value={"select"}>Select</option>
                        <option value={TokenAddress}>TFT</option>
                    </select>
                    <div>
                        <input onChange={this.onChangeAmount} className="input-group mb-3"/>
                        <Button variant="outline-success">
                            max
                        </Button>
                    </div>
                    <div>С кошелька <a href='#'>{
                        this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)
                        }</a> на сети {this.state.network}</div>
                    <div>
                        Доверенному кошельку
                        <input onChange={this.onChangeHeirAddress} value={this.state.heirAddress} className="input-group mb-3"/>
                    </div>
                    <div>
                        {"При условии что я буду неактивен(неактивна) более чем:"}
                        <div>
                            <input type="number" onChange={this.onChangeYear} value={this.state.year} className="input-group mb-3"/>
                            <label >Лет</label><br/>
                            <input type="number" onChange={this.onChangeMonth} value={this.state.month} className="input-group mb-3"/>
                            <label >Месяцев</label><br/>
                            <input type="number" onChange={this.onChangeDay} value={this.state.day} className="input-group mb-3"/>
                            <label >Дней</label><br/>
                        </div>
                    </div>
                    <div>
                        <input type="checkbox" className="form-check-input mt-0"/>
                        <label >Add NFT Message</label><br/>
                        <input type="checkbox" disabled={true} className="form-check-input mt-0"/>
                        <label >Automatic token delivery (coming soon)</label><br/>
                        <input type="checkbox" disabled={true} className="form-check-input mt-0"/>
                        <label >Notifications (coming soon)</label><br/>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={this.state.approved == false ? this.approve : this.newWill}>
                    {this.state.approved == false ? "Approve": "Make new will"}
                </Button>
                <Button onClick={this.handleClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
            {/* <Modal show={this.state.showEdit} onHide={this.handleCloseEdit}>
                <Modal.Header>
                    <Modal.Title>Edit Will</Modal.Title>
                </Modal.Header>
                <Button onClick={this.handleShowEditTimeWhenWithdraw} variant="outline-success">
                    Time When Withdraw
                </Button>
                <Button onClick={this.handleShowEditHeir} variant="outline-success">
                    Heir
                </Button>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.handleCloseEdit} className="btn btn-danger">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal> */}
            {/* <Modal show={this.state.showEditTimeWhenWithdraw} onHide={this.handleCloseEditTimeWhenWithdraw}>
                <Modal.Header>
                    <Modal.Title>Time When Withdraw</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div>
                            Время передачи наследства сейчас: {
                                this.timeConverter(parseInt(this.state.currentEditTimeWhenWithdraw))
                            }
                        </div>
                        Добавить к {
                            this.timeConverter(
                                Math.round(
                                    (new Date()).getTime() / 1000
                                )
                            )
                        }
                        <div>
                            <input type="number" onChange={this.onChangeYear} className="input-group mb-3"/>
                            <label >Лет</label><br/>
                            <input type="number" onChange={this.onChangeMonth} className="input-group mb-3"/>
                            <label >Месяцев</label><br/>
                            <input type="number" onChange={this.onChangeDay} className="input-group mb-3"/>
                            <label >Дней</label><br/>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={this.editTimeWhenWithdraw}>
                        Edit
                    </Button>
                    <Button variant="danger" onClick={this.handleCloseEditTimeWhenWithdraw} className="btn btn-danger">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal> */}
            {/* <Modal show={this.state.showEditHeir} onHide={this.handleCloseEditHeir}>
                <Modal.Header>
                    <Modal.Title>Heir</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div>
                            Наследник сейчас: {this.state.currentEditHeirAddress}
                        </div>
                        <div>
                            Поменять на:
                            <input onChange={this.onChangeHeirAddress} className="input-group mb-3"/>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={this.editHeir}>
                        Edit
                    </Button>
                    <Button variant="danger" onClick={this.handleCloseEditHeir} className="btn btn-danger">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal> */}
            <Modal show={this.state.showConfirm}>
                <Modal.Header>
                    <div className="load-6">
                        <div className="letter-holder">
                        <div className="l-1 letter">C</div>
                        <div className="l-2 letter">o</div>
                        <div className="l-3 letter">n</div>
                        <div className="l-4 letter">f</div>
                        <div className="l-5 letter">i</div>
                        <div className="l-6 letter">r</div>
                        <div className="l-7 letter">m</div>
                        <div className="l-8 letter">.</div>
                        <div className="l-9 letter">.</div>
                        <div className="l-10 letter">.</div>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.handleCloseConfirm} className="btn btn-danger">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={this.state.showAwait}>
                <Modal.Header>
                    <div className="load-6">
                        <div className="letter-holder">
                        <div className="l-1 letter">A</div>
                        <div className="l-2 letter">w</div>
                        <div className="l-3 letter">a</div>
                        <div className="l-4 letter">i</div>
                        <div className="l-5 letter">t</div>
                        <div className="l-6 letter">.</div>
                        <div className="l-7 letter">.</div>
                        <div className="l-8 letter">.</div>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.handleCloseAwait} className="btn btn-danger">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
        )
    }
}

export default Wills;