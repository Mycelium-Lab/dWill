/* global BigInt */

import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";
import { TheWillAddress, TokenAddress, UnlimitedAmount } from '../Utils/Constants';

import ERC20 from '../Contract/ERC20.json'
const styles = {
    modal_new_will: {
        position: 'absolute',
        width: '700px',
        left: '25%',
        top: '1%',
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
            amount: UnlimitedAmount,
            show: false,
            showWalletNotExist: false,
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
            isUnlimitedAmount: true,
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
            let timeUnixWhenWithdraw = 0;
            date = new Date(date.setFullYear(date.getFullYear()+parseInt(year)))
            date = new Date(date.setMonth(date.getMonth()+parseInt(month)))
            date = date.addDays(parseInt(day))
            timeUnixWhenWithdraw = Math.floor(date.getTime() / 1000)
            let sendTo = isUnlimitedAmount === true ? amount : BigInt(amount * Math.pow(10, await _token.decimals())).toString()
            await contract.addNewWill(heirAddress, tokensValue, timeUnixWhenWithdraw.toString(), sendTo)
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
            const { contractAddress, signer, signerAddress, tokensValue, amount, contract } = this.state
            this.setState({
                amount: event.target.value
            })
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            const allowance = await _token.allowance(signerAddress, contractAddress)
            const decimals = await _token.decimals()
            const allWillsAmountThisToken = await contract.getAllWillsAmountThisToken(signerAddress, _token.address)
            this.changeApproved(
                BigInt(allowance), 
                BigInt(allWillsAmountThisToken) + BigInt(event.target.value * Math.pow(10, decimals)), 
                decimals
            )
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
            const { contractAddress, signer, signerAddress, tokensValue, amount, isUnlimitedAmount, contract } = this.state
            //max amount uint256
            this.setState({
                amount: isUnlimitedAmount === false ? UnlimitedAmount : '0',
                isUnlimitedAmount: isUnlimitedAmount === true ? false : true,
            })
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            const allowance = await _token.allowance(signerAddress, contractAddress)
            const allWillsAmountThisToken = await contract.getAllWillsAmountThisToken(signerAddress, _token.address)
            this.changeApproved(BigInt(allowance), BigInt(allWillsAmountThisToken) + BigInt(this.state.amount))
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
        const { contractAddress, signer, signerAddress, tokensValue, amount, contract } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        const allowance = await _token.allowance(signerAddress, contractAddress)
        const decimals = await _token.decimals()
        const allWillsAmountThisToken = await contract.getAllWillsAmountThisToken(signerAddress, _token.address)
        await _token.balanceOf(signerAddress)
            .then(async (balance) => {
                console.log(BigInt(balance) - BigInt(allWillsAmountThisToken))
                this.setState({
                    amount: (Math.floor((balance - allWillsAmountThisToken) / Math.pow(10, await _token.decimals()))).toString()
                })
                this.changeApproved(
                    BigInt(allowance), 
                    BigInt(balance) - BigInt(allWillsAmountThisToken), 
                    decimals
                )
            })
    }

    changeApproved(allowance, amount, decimals) {
        try {
            if (allowance >= amount) {
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
            const { contractAddress, signer, signerAddress, tokenAddress, amount, contract } = this.state
            const _token = new ethers.Contract(event.target.value, ERC20.abi, signer)
            this.setState({
                tokensValue: event.target.value
            })
            const allowance = await _token.allowance(signerAddress, contractAddress)
            const decimals = await _token.decimals()
            const allWillsAmountThisToken = await contract.getAllWillsAmountThisToken(signerAddress, _token.address)
            this.changeApproved(
                BigInt(allowance), 
                BigInt(allWillsAmountThisToken) + BigInt(amount === UnlimitedAmount ? UnlimitedAmount : amount * Math.pow(10, decimals)), 
                decimals
            )
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

    handleShowWalletNotExist = () => this.setState({showWalletNotExist: true})
    handleCloseWalletNotExist = () => this.setState({showWalletNotExist: false})

    handleShowWalletNotExist = this.handleShowWalletNotExist.bind(this)
    handleCloseWalletNotExist = this.handleCloseWalletNotExist.bind(this)

    render() {
        return(
        <><div>
                <Button variant="primary" className="btn-new-will" onClick={this.props.isEthereumNull === false ? this.handleShow : this.handleShowWalletNotExist}>
                    New Will
                </Button>
                <div className='modal_fade'></div>
                <Modal show={this.state.showWalletNotExist} onHide={this.handleCloseWalletNotExist} className='modal_content' style={{
                    position: 'absolute',
                    // width: '700px',
                    left: '25%',
                    top: '150px',
                    background: '#1B232A',
                }}>
                    <Modal.Header className='modal_new_will'>
                        <Button className='bnt_close' onClick={this.handleCloseWalletNotExist}>
                            <img src="./content/close_modal.svg"/>  
                        </Button>
                        <Modal.Title className='modal_title'>Wallet Not Exist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='modal_new_will'>
                        <div className='title_trusted-wallet'>To create a dWill connect a Web3 wallet</div>
                        <button className='btn-new-will'>
                            <img src="" alt="" />
                            Connect MetaMask
                        </button>
                        <p className='title_trusted-wallet'>What is a wallet?</p>
                        <p className='title_trusted-wallet'>Wallets are used to send, receive, and store digital
                            assets. Connecting a wallet lets you interact with apps.
                            <a href="https://metamask.io/" target="_blank">Install the wallet.</a>
                        </p>
                    </Modal.Body>
                </Modal>
                <Modal show={this.state.show} onHide={this.handleClose} className='modal_content' style={styles.modal_new_will}>
                    <Modal.Header className='modal_new_will'>
                        <Button className='bnt_close' onClick={this.handleClose}>
                            <img src="content/button_close.svg" />
                        </Button>
                        <Modal.Title className='modal_title'>New Will</Modal.Title>
                        <hr />
                    </Modal.Header>
                    <Modal.Body>
                        <div className='modal_will-tokens'>
                            <div>
                                Я завещаю мои
                            </div>
                            <hr />
                            <select className="form-select" name="tokens" onChange={this.onChangeTokens} value={this.state.tokensValue}>
                                <option value={"select"}>Select</option>
                                <option value={TokenAddress}>TFT</option>
                                <option value={'0xE097d6B3100777DC31B34dC2c58fB524C2e76921'}>USDC</option>
                            </select>
                            <div>
                            </div>
                            <input type="checkbox" onChange={this.onChangeUnlimitedAmount} checked={this.state.isUnlimitedAmount} className="checkbox_unlited" />
                            <label className='checkbox_unlimited'>Unlimited</label><br />
                            <div className="modal_input-max">
                            <input onChange={this.onChangeAmount} value={this.state.amount}  type='number' className="input-max" placeholder="Введите сумму" style={{ display: this.state.isUnlimitedAmount === false ? 'block' : 'none' }} />
                            <Button variant="outline-success" className='input-max-button' onClick={this.onSetMaxAmount} style={{ display: this.state.isUnlimitedAmount === false ? 'block' : 'none' }}>
                                max
                            </Button>
                            </div>
                        </div>
                        <div className='modal_wallet'>С кошелька <a href='#' className='modal_wallet_link'>{this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)}</a> на сети {this.state.network} <img scr="./content/poligun.svg"/></div>
                        <span className='title_trusted-wallet'>Доверенному кошельку</span>
                        <div><input onChange={this.onChangeHeirAddress} required className="input_trusted-wallet " /></div>
                        <div>
                            <div className='modal_title-time-will'>{"При условии что я буду неактивен(неактивна) более чем:"}</div>
                            <div className='modal_time-will'>
                                <div className='modal_time-years'>
                                    <input type="number" onChange={this.onChangeYear} value={this.state.year} className="input-group-time" />
                                    <label className="input-group-time-name">Лет</label><br />
                                </div>
                                <div className='modal_time-months'>
                                    <input type="number" onChange={this.onChangeMonth} value={this.state.month} className="input-group-time" />
                                    <label className="input-group-time-name">Месяцев</label><br />
                                </div>
                                <div className='modal_time-days'>
                                    <input type="number" onChange={this.onChangeDay} value={this.state.day} className="input-group-time" />
                                    <label className="input-group-time-name">Дней</label><br />
                                </div>
                            </div>
                        </div>
                        <div className='modal_checkbox'>
                            <input type="checkbox" disabled={true} className="modal_checkbox-add-nft" />
                            <label>Add NFT Message (coming soon)</label>

                            <br />
                            <input type="checkbox" disabled={true} className="modal_checkbox-automatic-token-delivery" />
                            <label>Automatic token delivery (coming soon)</label><br />
                            <input type="checkbox" onChange={this.changeNotifications} disabled={false} className="modal_checkbox-notifications" />
                            <label>Notifications</label><br />
                            <div style={this.state.notificationsOn === true ? { display: 'block' } : { display: 'none' }}>
                                <a href='https://t.me/thewill_bot' target="_blank" rel="noreferrer">Добавить оповещения вы можете в нашем телеграмм боте</a>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="button_number_one">
                        <p>  1. </p><Button variant="primary" onClick={this.state.approved === false ? this.approve : null} style={{ "background": this.state.approved === false ? '#5ED5A8' : '#3E474F' }} className='button_approve'>
                            Approve
                        </Button>
                        </div>
                        <div className="button_number_two"> <p className="button_text_number"> 2. </p>
                        <Button variant="primary" onClick={this.state.approved === false ? null : this.newWill} style={{ "background": (this.state.approved === false) || (this.state.amount === '0') || (this.state.amount === '') ? '#3E474F' : '#5ED5A8' }} className='button_make-new-will'>
                            <span className="button_number-span">Make new will </span>
                        </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div><Modal show={this.state.showConfirm} className="modal-confirm">
                    <Modal.Header>
                        <h2 className='modal-confirm_h2'>Pending  transaction</h2>
                    </Modal.Header>
                    <img scr='content/confi.svg' />
                    <Modal.Footer>
                        <p className="modal-confirm_text">Please confirm transaction in your web3 wallet</p>
                    </Modal.Footer>
                </Modal><Modal show={this.state.showAwait} className="modal-await">
                    <Modal.Header>
                        {/* <Button variant="danger" onClick={this.handleCloseAwait} className="btn btn-danger">
    <img src="content/button_close.svg"/>
    </Button>   */}
                    </Modal.Header>
                    <img src="content/loading.svg" />
                    <Modal.Footer>
                        <p className="modal-await_text">Завещание успешно создано!</p>
                    </Modal.Footer>
                </Modal><Modal show={this.state.showError}>
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
                </Modal><div className='overlay'></div></>
        )
    }
}

export default NewWill 