/* global BigInt */

import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'
import { ethers } from "ethers";
import { chainIDs, UnlimitedAmount } from '../Utils/Constants';
import closeModalPic from '../content/close_modal.svg'
import buttonClosePic from '../content/button_close.svg'
import PolygonPic from '../content/poligon.svg'
import EthereumPic from '../content/ethereum.svg'
import BinancePic from '../content/binance.svg'
import ConfiPic from '../content/confi.svg'
import LoadingPic from '../content/loading.svg'
import arrowDown from '../content/arrow-down.svg'
import closePic from '../content/button_close.svg'
import ERC20 from '../Contract/ERC20.json'

const styles = {
    modal_new_will: {
        // maxWidth: '700px',
        // left: '25%',
        // width: '100%',
        // top: '1%',
        // background: '#1B232A',
    }
}

Date.prototype.addDays = function (days) {
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
            contractAddress: props.contractAddress,
            year: 2,
            month: 0,
            day: 0,
            heirAddress: '',
            heirAddressShort: '',
            contract: null,
            showConfirm: false,
            showAwait: false,
            showError: false,
            newWillDone: false,
            showEventConfirmed: false,
            isUnlimitedAmount: true,
            errortext: '',
            notificationsOn: false,
            networkPic: EthereumPic,
            googleCalendarDateText: '',
            processingText: '',
            confirmedText: ''
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(this.props.contractAddress, TheWill.abi, signer)
            let networkName
            let networkPic
            if (this.props.network === chainIDs.BinanceMainnet) {
                networkName = `BNB Chain`
                networkPic = BinancePic
            } else if (this.props.network === chainIDs.Polygon) {
                networkName = `Polygon`
                networkPic = PolygonPic
            } else if (this.props.network === 31337) {
                networkName = `Hardhat`
                networkPic = EthereumPic
            } else if (this.props.network === chainIDs.Mumbai) {
                networkName = `Mumbai`
                networkPic = PolygonPic
            } else if (this.props.network === chainIDs.Goerli) {
                networkName = `Goerli`
                networkPic = EthereumPic
            } else if (this.props.network === chainIDs.EthereumMainnet) {
                networkName = `Ethereum`
                networkPic = EthereumPic
            } else if (this.props.network === chainIDs.BinanceTestnet) {
                networkName = `BNBTest Chain`
                networkPic = BinancePic
            }
            this.createTime()
            this.setState({ signer, signerAddress, network: networkName, contract, networkPic })
        } catch (error) {
            console.error(error)
        }
    }

    async approve() {
        const { contractAddress, signer, amount, tokensValue, isUnlimitedAmount } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        this.handleShowConfirm()
        let toSend = isUnlimitedAmount === true ? amount : BigInt(amount * Math.pow(10, await _token.decimals())).toString()
        const symbol = await _token.symbol()
        await _token.increaseAllowance(contractAddress, toSend)
            .then(async (tx) => {
                this.handleShowAwait(`Approve ${symbol}`)
                await tx.wait()
                    .then(() => {
                        this.handleCloseAwait()
                        this.handleShowEventConfirmed(`Approved ${symbol}`)
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

    createTime() {
        const { year, month, day } = this.state
        let date = new Date()
        date = new Date(date.setFullYear(date.getFullYear() + parseInt(year)))
        date = new Date(date.setMonth(date.getMonth() + parseInt(month)))
        date = date.addDays(parseInt(day))
        let _gTime = date.toISOString().replaceAll('-', '').replaceAll(':', '')
        _gTime = _gTime.slice(0, _gTime.indexOf('.'))
        this.setState({
            googleCalendarDateText: `${_gTime}Z`
        })
        return date
    }

    async newWill() {
        try {
            const { contract, heirAddress, amount, isUnlimitedAmount, tokensValue, signer } = this.state
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            let date = this.createTime()
            let timeUnixWhenWithdraw = 0;
            timeUnixWhenWithdraw = Math.floor(date.getTime() / 1000)
            let sendTo = isUnlimitedAmount === true ? amount : BigInt(amount * Math.pow(10, await _token.decimals())).toString()
            this.handleShowConfirm()
            await contract.addNewWill(heirAddress, tokensValue, timeUnixWhenWithdraw.toString(), sendTo)
                .then(async (tx) => {
                    this.handleShowAwait('New Will Creation')
                    await tx.wait()
                    this.handleCloseAwait()
                    this.handleClose()
                    this.handleShowDoneNewWill()
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
            const { contractAddress, signer, signerAddress, tokensValue, contract } = this.state
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
                    errortext: 'Выберите токен1'
                })
                this.handleShowError()
            }
        }
    }

    async onChangeUnlimitedAmount() {
        try {
            const { contractAddress, signer, signerAddress, tokensValue, isUnlimitedAmount } = this.state
            //max amount uint256
            this.setState({
                amount: isUnlimitedAmount === false ? UnlimitedAmount : '0',
                isUnlimitedAmount: isUnlimitedAmount === true ? false : true,
            })
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            const allowance = await _token.allowance(signerAddress, contractAddress)
            this.changeApproved(BigInt(allowance), BigInt(this.state.amount))
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
        const { contractAddress, signer, signerAddress, tokensValue, contract } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        const allowance = await _token.allowance(signerAddress, contractAddress)
        const decimals = await _token.decimals()
        const allWillsAmountThisToken = await contract.getAllWillsAmountThisToken(signerAddress, _token.address)
        await _token.balanceOf(signerAddress)
            .then(async (balance) => {
                //set max amount allowed to send
                this.setState({
                    amount: (Math.floor((balance) / Math.pow(10, await _token.decimals()))).toString()
                })
                this.changeApproved(
                    BigInt(allowance),
                    BigInt(balance) + BigInt(allWillsAmountThisToken),
                    decimals
                )
            })
    }

    changeApproved(allowance, amount) {
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
            const { contractAddress, signer, signerAddress, amount, contract } = this.state
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
        }, () => {
            this.createTime()
        })
    }

    onChangeMonth(event) {
        this.setState({
            month: event.target.value
        }, () => {
            this.createTime()
        })
    }

    onChangeDay(event) {
        this.setState({
            day: event.target.value
        }, () => {
            this.createTime()
        })
    }

    onChangeHeirAddress(event) {
        this.setState({
            heirAddress: event.target.value
        }, () => {
            this.setState({
                heirAddressShort: this.state.heirAddress.slice(0, 6) + '...' + this.state.heirAddress.slice(this.state.heirAddress.length - 4, this.state.heirAddress.length)
            })
        })
    }

    changeNotifications() {
        this.createTime()
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
    handleShow = () => this.setState({ show: true });

    handleClose = this.handleClose.bind(this)
    handleShow = this.handleShow.bind(this)

    handleShowConfirm = () => this.setState({ showConfirm: true })
    handleShowAwait = (processingText) => this.setState({ showConfirm: false, showAwait: true, processingText })
    handleCloseConfirm = () => this.setState({ showConfirm: false })
    handleCloseAwait = () => this.setState({ showAwait: false })
    handleShowConfirm = this.handleShowConfirm.bind(this)
    handleShowAwait = this.handleShowAwait.bind(this)
    handleCloseConfirm = this.handleCloseConfirm.bind(this)
    handleCloseAwait = this.handleCloseAwait.bind(this)

    handleShowError = () => this.setState({ showError: true })
    handleCloseError = () => this.setState({ showError: false })

    handleShowError = this.handleShowError.bind(this)
    handleCloseError = this.handleCloseError.bind(this)

    handleShowWalletNotExist = () => this.setState({ showWalletNotExist: true })
    handleCloseWalletNotExist = () => this.setState({ showWalletNotExist: false })

    handleShowWalletNotExist = this.handleShowWalletNotExist.bind(this)
    handleCloseWalletNotExist = this.handleCloseWalletNotExist.bind(this)

    handleShowDoneNewWill = () => this.setState({ newWillDone: true })
    handleCloseDoneNewWill = () => this.setState({ newWillDone: false })

    handleShowDoneNewWill = this.handleShowDoneNewWill.bind(this)
    handleCloseDoneNewWill = this.handleCloseDoneNewWill.bind(this)

    handleShowEventConfirmed = (confirmedText) => this.setState({ showEventConfirmed: true, confirmedText })
    handleCloseEventConfirmed = () => this.setState({ showEventConfirmed: false })

    handleShowEventConfirmed = this.handleShowEventConfirmed.bind(this)
    handleCloseEventConfirmed = this.handleCloseEventConfirmed.bind(this)

    render() {
        return (
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
                            <img src={closeModalPic} alt="close" />
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
                            <a href="https://metamask.io/" target="_blank" rel="noreferrer">Install the wallet.</a>
                        </p>
                    </Modal.Body>
                </Modal>
                <Modal show={this.state.show} onHide={this.handleClose} className='will-block' style={styles.modal_new_will}>
                    <Modal.Header className='modal_new_will'>
                        <Button className='bnt_close' onClick={this.handleClose}>
                            <img src={buttonClosePic} alt="close" />
                        </Button>
                        <Modal.Title className='modal_title'>New Will</Modal.Title>
                        <hr />
                    </Modal.Header>
                    <Modal.Body>
                        <div className="modal-body__row">
                            <div className="your-wills__header">
                                <div>
                                    Я завещаю мои
                                </div>
                                <div className="form-select__wrapper">
                                    <select className="form-select" name="tokens" onChange={this.onChangeTokens} value={this.state.tokensValue}>
                                        <option value={"select"}>Select</option>
                                        <option value={this.props.tokenAddress}>TFT</option>
                                        <option value={'0xE097d6B3100777DC31B34dC2c58fB524C2e76921'}>USDC</option>
                                    </select>
                                    <div className="form-select__arrow">
                                        <img src={arrowDown} alt="arrow" />
                                    </div>
                                </div>
                                <div className="your-wills__checkbox">
                                    <input id="unlimited" type="checkbox" onChange={this.onChangeUnlimitedAmount} checked={this.state.isUnlimitedAmount} className="form-check-input mt-0" />
                                    <label htmlFor="unlimited">Unlimited</label><br />
                                </div>
                                <div style={{ display: this.state.isUnlimitedAmount === false ? 'block' : 'none' }} className="your-wills__max mt-0">
                                    <input placeholder="Введите сумму" onChange={this.onChangeAmount} value={this.state.currentEditAmount} type="number" className="input-group mb-3" />
                                    <Button variant="outline-success" onClick={this.onSetMaxAmount}>
                                        All
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className='modal-body__row modal-body__row-direction'>С кошелька <a href={`${this.props.networkProvider}${this.state.signerAddress}`} className='modal_wallet_link'>{this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)}</a><i class="br"></i> на сети {this.state.network}
                            <img src={this.state.networkPic} alt="networkpic" /></div>
                        <div className="your-wills__wallet modal-body__row">
                            Доверенному кошельку
                            <input onChange={this.onChangeHeirAddress} value={this.state.currentEditHeirAddress} className="input-group mb-3" required="required" />
                            <p>Поле обязательно для заполнения*</p>
                        </div>
                        <div className="modal-body__row">
                            <div className='modal_title-time-will'>{"При условии что я буду неактивен(неактивна) более чем:"}</div>
                            <div className="will-date">
                                <div className="will-date__row">
                                    <input type="number" max="100" onChange={this.onChangeYear} value={this.state.year} className="input-group input-group-year" />
                                    <label >Лет</label><br />
                                </div>
                                <div className="will-date__row">
                                    <input type="number" onChange={this.onChangeMonth} value={this.state.month} className="input-group input-group-month" />
                                    <label >Месяцев</label><br />
                                </div>
                                <div className="will-date__row">
                                    <input type="number" onChange={this.onChangeDay} value={this.state.day} className="input-group input-group-days" />
                                    <label >Дней</label><br />
                                </div>
                            </div>

                        </div>
                        <div className="your-wills__settings">
                            <div className="will-date__row will-date__row--checkbox">
                                <input id="wills-set1" type="checkbox" disabled={true} className="form-check form-check-input mt-0" />
                                <label htmlFor="wills-set1">Add NFT Message (coming soon)</label><br />
                            </div>
                            <div className="will-date__row will-date__row--checkbox">
                                <input id="wills-set2" type="checkbox" disabled={true} className="form-check form-check-input mt-0" />
                                <label htmlFor="wills-set2">Automatic token delivery (coming soon)</label><br />
                            </div>
                            <div className="will-date__row will-date__row--checkbox">
                                <input id="wills-set3" type="checkbox" onChange={this.changeNotifications} disabled={false} className="form-check form-check-input mt-0" />
                                <label htmlFor="wills-set3">Notifications</label><br />
                            </div>
                            <div style={this.state.notificationsOn === true ? { display: 'block' } : { display: 'none' }}>
                                <div>
                                    <a href={`http://www.google.com/calendar/event?action=TEMPLATE&text=${'dWill notification. dWill time expired.'}&dates=${this.state.googleCalendarDateText}/${this.state.googleCalendarDateText}&details=${`<div><b>ℹ️ dWill notification:</b></div><br/><div>The time to unlock the dWill has expired.</div><br/<div>Heir: <a href="${this.props.networkProvider + this.state.heirAddress}">${this.state.heirAddressShort}</a></div><br/><br/><div>You can see more info on our website.</div><br/><a href="https://dwill.app"><b>dWill.app</b></a>`}&trp=false&sprop=&sprop=name:`} target="_blank" rel="noreferrer">Set notifications in Google Calendar</a>
                                </div>
                                <div>
                                    <a href='https://t.me/thewill_bot' target="_blank" rel="noreferrer">Добавить оповещения вы можете в нашем телеграмм боте</a>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div>
                            <ul className="your-wills__footer">
                                <li>
                                    <Button variant="primary" onClick={this.state.approved === false ? this.approve : null} style={
                                        { "background": this.state.approved === true ? '#3E474F' : '#5ED5A8' }
                                    } >
                                        Approve
                                    </Button>
                                </li>
                                <li>
                                    <Button variant="primary" onClick={this.state.approved === false ? null : this.newWill} style={{ "background": (this.state.approved === false) || (this.state.amount === '0') || (this.state.amount === '') ? '#3E474F' : '#5ED5A8' }} className='button_make-new-will'>
                                        <span className="button_number-span">Make new will </span>
                                    </Button>
                                </li>
                            </ul>
                            <Button className="btn-close-modal" onClick={this.handleCloseEdit}>

                            </Button>
                        </div>
                    </Modal.Footer>

                </Modal>
            </div>
                <Modal show={this.state.showConfirm} className="modal-confirm">
                    <Modal.Header>
                        <h2 className='modal-confirm_h2'>Pending  transaction</h2>
                    </Modal.Header>
                    {/* <img className="spinner" src={LoadingPic} /> */}
                    <div class="ml-loader">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    <Modal.Footer>
                        <p className="modal-confirm_text">Please confirm transaction in your web3 wallet</p>
                        {/* <button className="btn-close-modal btn btn-primary">
                            <img src={closeModalPic}></img>
                        </button> */}
                    </Modal.Footer>
                </Modal>
                <Modal className="modal-loading modal-loading--process" show={this.state.showEventConfirmed}>
                    <Modal.Header>
                        <div className="modal_confirm">
                            <h2 className="modal-loading__title modal-loading__title--confirmed">Confirmed!</h2>
                            <p className="modal-loading__subtitle">{this.state.confirmedText}</p>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--confirmed">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.handleCloseEventConfirmed} className="btn btn-danger">
                            <img src={closePic} />
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal className="modal-loading modal-loading--process" show={this.state.showAwait}>
                    <Modal.Header>
                        <div className="modal_confirm">
                            <h2 className="modal-loading__title modal-loading__title--processing">Processing...</h2>
                            <p className="modal-loading__subtitle">{this.state.processingText}</p>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--processing">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.handleCloseAwait} className="btn btn-danger">
                            <img src={closePic} />
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.newWillDone} className="modal-await">
                    {/* <Modal.Header>
                        <Button variant="danger" onClick={this.handleCloseDoneNewWill} className="btn btn-danger">
                            <img src={closeModalPic} />
                        </Button>
                    </Modal.Header> */}
                    <img src={ConfiPic} />
                    <Modal.Footer>
                        <button className="btn-close-modal btn btn-primary">
                            <img src={closeModalPic}></img>
                        </button>
                        <p className="modal-await_text">Завещание успешно создано!</p>
                    </Modal.Footer>
                </Modal>
                {/* <Modal className="modal-small" show={this.state.showError}>
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
                </Modal> */}
                <Modal className="modal-loading modal-loading--process" show={this.state.showError}>
                    <Modal.Header>
                        <div className="modal_confirm">
                            <h2 className="modal-loading__title modal-loading__title--error">Error</h2>
                            <div>{this.state.errortext}</div>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--error">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" className="btn btn-danger">
                            <img src={closePic} alt="close" />
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className='overlay'></div></>
        )
    }
}

export default NewWill 