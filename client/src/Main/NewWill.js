/* global BigInt */

import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";
import { TheWillAddress, TokenAddress } from '../Utils/Constants';

import ERC20 from '../Contract/ERC20.json'
const styles = {
    modal_new_will: {
        position: 'absolute',
        width: '700px',
        left: '25%',
        top: '15%',
        background: '#1B232A',
    }
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

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
            contractAddress: TheWillAddress,
            year: 2,
            month: 0,
            day: 0,
            heirAddress: '',
            contract: null,
            showConfirm: false,
            showAwait: false,
            showError: false,
            isUnlimitedAmount: false,
            errortext: '',
            notificationsOn: false
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
            let networkName
            if (network.chainId === 56) {
                networkName = `BNB Chain`
            } else if (network.chainId === 137) {
                networkName = `Polygon`
            } else if (network.chainId === 31337) {
                networkName = `Hardhat`
            } else if (network.chainId === 5) {
                networkName = `Goerli`
            } else if (network.chainId === 80001) {
                networkName = `Mumbai`
            }
            this.setState({ signer, signerAddress, network: networkName, contract })
        } catch (error) {
            console.error(error)
        }
    }

    async approve() {
        const { contractAddress, signer, amount, tokensValue, isUnlimitedAmount } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        this.handleShowConfirm()
        let toSend = isUnlimitedAmount === true ? amount : BigInt(amount * Math.pow(10, await _token.decimals())).toString()
        await _token.increaseAllowance(contractAddress, toSend)
            .then(async (tx) => {
                this.handleShowAwait()
                await tx.wait()
                .then(() => {
                    this.handleCloseAwait()
                    this.setState({
                        approved: true
                    })
                })
            })
            .catch(err => {
                console.log(err)
                if (err.message.includes('resolver or addr is not ')) {
                    this.setState({
                        errortext: 'Choose token'
                    })
                    this.handleShowError()
                }
                this.handleCloseConfirm()
                this.handleCloseAwait()
            })
    }

    async newWill() {
        try {
            const { contract, heirAddress, amount, year, month, day, isUnlimitedAmount, tokensValue, signer } = this.state
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            let date = new Date()
            let timeUnixNow = Math.floor(new Date().getTime() / 1000)
            let timeUnixWhenWithdraw = 0;
            date = new Date(date.setFullYear(date.getFullYear()+parseInt(year)))
            date = new Date(date.setMonth(date.getMonth()+parseInt(month)))
            date = date.addDays(parseInt(day))
            timeUnixWhenWithdraw = Math.floor(date.getTime() / 1000)
            const timeBetweenWithdrawAndStart = timeUnixWhenWithdraw - timeUnixNow
            let sendTo = isUnlimitedAmount === true ? amount : BigInt(amount * Math.pow(10, await _token.decimals())).toString()
            await contract.addNewWill(heirAddress, tokensValue, timeUnixWhenWithdraw.toString(), timeBetweenWithdrawAndStart.toString(), sendTo)
                .then(async (tx) => {
                    this.handleShowAwait()
                    await tx.wait()
                    this.handleCloseAwait()
                    this.handleClose()
                })
        } catch (error) {
            console.error(error)
            if (error.message.includes('resolver or addr is not configured')) {
                this.setState({
                    errortext: 'Добавьте адрес'
                })
                this.handleShowError()
            }
            if (error.message.includes('invalid BigNumber string')) {
                this.setState({
                    errortext: 'Введите время правильно'
                })
                this.handleShowError()
            }
            this.handleShowError()
            this.handleCloseConfirm()
            this.handleCloseAwait()
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
            this.changeApproved(allowance, event.target.value, await _token.decimals())
        } catch (error) {
            if (error.message.includes('resolver or addr is not configured')) {
                this.setState({
                    errortext: 'Выберите токен'
                })
                this.handleShowError()
            }
        }
    }

    async onChangeUnlimitedAmount() {
        try {
            const { contractAddress, signer, signerAddress, tokensValue, amount, isUnlimitedAmount } = this.state
            //max amount uint256
            this.setState({
                amount: isUnlimitedAmount === false ? '11579208923731619542357098500868790785326998466564056403945758400791312963993' : '0',
                isUnlimitedAmount: isUnlimitedAmount === true ? false : true,
            })
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            const allowance = (await _token.allowance(signerAddress, contractAddress)).toString()
            this.changeApproved(allowance, this.state.amount, await _token.decimals())
        } catch (error) {
            if (error.message.includes('resolver or addr is not configured')) {
                this.setState({
                    errortext: 'Выберите токен',
                    amount: '0',
                    isUnlimitedAmount: false
                })
                this.handleShowError()
            }
        }
    }

    async onSetMaxAmount() {
        const { contractAddress, signer, signerAddress, tokensValue, amount } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        await _token.balanceOf(signerAddress)
            .then(async (balance) => {
                this.setState({
                    amount: (balance / Math.pow(10, await _token.decimals())).toString()
                })
            })
    }

    changeApproved(allowance, amount, decimals) {
        try {
            if (parseInt(allowance) >= parseInt((amount * Math.pow(10, decimals))) && parseInt(allowance) !== 0) {
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
            if (error.reason.includes('invalid decimal value')) {
                this.state({
                    errortext: 'Неправильно введена сумма'
                })
            }
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
            console.log(error)
            this.handleShowError()
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

    changeNotifications() {
        this.setState({
            notificationsOn: this.state.notificationsOn === true ? false : true
        })
    }

    onChangeUnlimitedAmount = this.onChangeUnlimitedAmount.bind(this)
    onSetMaxAmount = this.onSetMaxAmount.bind(this)
    approve = this.approve.bind(this)
    newWill = this.newWill.bind(this)
    onChangeTokens = this.onChangeTokens.bind(this)
    onChangeAmount = this.onChangeAmount.bind(this)
    changeApproved = this.changeApproved.bind(this)
    onChangeYear = this.onChangeYear.bind(this)
    onChangeMonth = this.onChangeMonth.bind(this)
    onChangeDay = this.onChangeDay.bind(this)
    onChangeHeirAddress = this.onChangeHeirAddress.bind(this)
    changeNotifications = this.changeNotifications.bind(this)

    handleClose = () => this.setState({
        show: false,
        amount: '0',
        approved: false,
        year: 2,
        month: 0,
        day: 0,
        heirAddress: '',
        isUnlimitedAmount: false,
    });
    handleShow = () => this.setState({show: true});

    handleClose = this.handleClose.bind(this)
    handleShow = this.handleShow.bind(this)

    handleShowConfirm = () => this.setState({showConfirm: true})
    handleShowAwait = () => this.setState({showConfirm: false, showAwait: true})
    handleCloseConfirm = () => this.setState({showConfirm: false})
    handleCloseAwait = () => this.setState({showAwait: false})
    handleShowConfirm = this.handleShowConfirm.bind(this)
    handleShowAwait = this.handleShowAwait.bind(this)
    handleCloseConfirm = this.handleCloseConfirm.bind(this)
    handleCloseAwait = this.handleCloseAwait.bind(this)

    handleShowError = () => this.setState({showError: true})
    handleCloseError = () => this.setState({showError: false})

    handleShowError = this.handleShowError.bind(this)
    handleCloseError = this.handleCloseError.bind(this)

    render() {
        return(
        <div>
            <Button variant="primary" className="btn-new-will" onClick={this.handleShow}>
                New Will
            </Button>
            
            <Modal show={this.state.show} onHide={this.handleClose} className='modal_new_will' style={styles.modal_new_will}>
                <Modal.Header>
                <Modal.Title className='modal_title'>New Will</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='modal_will-tokens'>
                    <div>
                        Я завещаю мои
                    </div>
                    <select className="form-select" name="tokens" onChange={this.onChangeTokens} value={this.state.tokensValue}>
                        <option value={"select"}>Select</option>
                        <option value={TokenAddress}>TFT</option>
                        <option value={'0xE097d6B3100777DC31B34dC2c58fB524C2e76921'}>USDC</option>
                    </select>
                    <div>
                    </div>
                        <input type="checkbox" onChange={this.onChangeUnlimitedAmount} checked={this.state.isUnlimitedAmount} className="form-check-input mt-0"/>
                        <label>Unlimited</label><br/>
                        <input onChange={this.onChangeAmount} value={this.state.amount} type='number' className="input-group-mb-3" style={
                            {display: this.state.isUnlimitedAmount === false ? 'block' : 'none'}
                        }/>
                        <Button variant="outline-success" className='input-group-mb-3-button' onClick={this.onSetMaxAmount} style={
                            {display: this.state.isUnlimitedAmount === false ? 'block' : 'none'}
                        }>
                            max
                        </Button>
                    </div>
                    <div className='modal_wallet'>С кошелька <a href='#' className='modal_wallet_link'>{
                        this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)
                        }</a> на сети {this.state.network}</div>
                        <span className='title_trusted-wallet'>Доверенному кошельку</span>
                        <div><input onChange={this.onChangeHeirAddress} className="input_trusted-wallet"/></div>
                    <div>
                        <div className='modal_title-time-will'>{"При условии что я буду неактивен(неактивна) более чем:"}</div>
                        <div className='modal_time-will'>
                            <div className='modal_time-years'>
                            <input type="number" onChange={this.onChangeYear} value={this.state.year} className="input-group-time"/>
                            <label className="input-group-time-name" >Лет</label><br/>
                            </div>
                            <div className='modal_time-months'>
                            <input type="number" onChange={this.onChangeMonth} value={this.state.month} className="input-group-time"/>
                            <label className="input-group-time-name" >Месяцев</label><br/>
                            </div>
                            <div className='modal_time-days'>
                            <input type="number" onChange={this.onChangeDay} value={this.state.day} className="input-group-time"/>
                            <label className="input-group-time-name" >Дней</label><br/> 
                            </div>
                        </div>
                    </div>
                    <div className='modal_checkbox'>
                        <input type="checkbox" disabled={true} className="form-check-input mt-0"/>
                        <label >Add NFT Message (coming soon)</label><br/>
                        <input type="checkbox" disabled={true} className="form-check-input mt-0"/>
                        <label >Automatic token delivery (coming soon)</label><br/>
                        <input type="checkbox" onChange={this.changeNotifications} disabled={false} className="form-check-input mt-0"/>
                        <label >Notifications</label><br/>
                        <div style={this.state.notificationsOn === true ? {display: 'block'} : {display: 'none'}}>
                            <a href='https://t.me/thewill_bot' target="_blank" rel="noreferrer">Добавить оповещения вы можете в нашем телеграмм боте</a>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={this.state.approved === false ? this.approve : null} style={
                    {"background": this.state.approved === false ? '#5ED5A8' : '#3E474F'}
                } className='button_make-new-will'>
                    Approve
                </Button>
                <Button variant="primary" onClick={this.state.approved === false ? null : this.newWill} style={
                    {"background": (this.state.approved === false) || (this.state.amount === '0') || (this.state.amount === '') ? '#3E474F' : '#5ED5A8'}
                } className='button_make-new-will'>
                    Make new will
                </Button>
                <Button onClick={this.handleClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
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
            <Modal show={this.state.showError}>
                <Modal.Header>
                    <div>
                        <h1>Error</h1>
                        <div>{this.state.errortext}</div>
                    </div>
                </Modal.Header>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.handleCloseError} className="btn btn-danger">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className='overlay'></div>
        </div>
        
        )
    }
}

export default NewWill 