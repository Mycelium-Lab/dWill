/* global BigInt */

import React, { Component } from 'react';
import Select, { components } from 'react-select'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal'
import TheWill from '../Contract/TheWill.json'
import { ethers } from "ethers"
import { chainIDs, UnlimitedAmount } from '../Utils/Constants'
import closeModalPic from '../content/close_modal.svg'
import buttonClosePic from '../content/button_close.svg'
import PolygonPic from '../content/poligon.svg'
import BinancePic from '../content/binance.svg'
import EthereumPic from '../content/ethereum.svg'
import AvalanchePic from '../content/avalanche.svg'
import OptimismPic from '../content/optimism.svg'
import ArbitrumPic from '../content/arbitrum.svg'
import ConfiPic from '../content/confi.svg'
import closePic from '../content/button_close.svg'
import btnTelegram from '../content/btnTelegram.svg'
import btnCalendar from '../content/btnCalendar.svg'
import btnEmail from '../content/btnEmail.svg'
import infoBtn from '../content/info-btn.svg'
import linkBtn from '../content/link-btn.png'
import ERC20 from '../Contract/ERC20.json'
import BinanceMainnetTokens from '../Utils/tokens/binanceMainnet.json'
import BinanceTestnetTokens from '../Utils/tokens/binanceTestnet.json'
import MumbaiTokens from '../Utils/tokens/mumbai.json'
import GoerliTokens from '../Utils/tokens/goerli.json'
import UniswapTokens from '../Utils/tokens/uniswap.json'
import AvalancheTokens from '../Utils/tokens/avalanche.json'
import { select } from '../Utils/styles/select'
import { tooltipText } from '../Utils/tooltipText';

const { Option } = components;
const IconOption = props => (
    <Option {...props}>
        <img className="select-pic"
            src={props.data.icon}
            alt={props.data.label}
        />
        {props.data.label}
    </Option>
);

const styles = {
    modal_new_will: {
        // maxWidth: '700px',
        // left: '25%',
        // width: '100%',
        // top: '1%',
        // background: '#1B232A',
    },
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
            amount: ethers.constants.MaxUint256.toString(),
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
            confirmedText: '',
            hash: '',
            limitedText: 'unlimited',
            isAddress: false
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(this.props.contractAddress, TheWill.abi, signer)
            this.createTime()
            let networkPic
            if (this.props.network === chainIDs.Mumbai) {
                networkPic = PolygonPic
            } else if (this.props.network === chainIDs.Goerli) {
                networkPic = EthereumPic
            } else if (this.props.network === chainIDs.Polygon) {
                networkPic = PolygonPic
            } else if (this.props.network === chainIDs.BinanceTestnet) {
                networkPic = BinancePic
            } else if (this.props.network === chainIDs.BinanceMainnet) {
                networkPic = BinancePic
            } else if (this.props.network === chainIDs.EthereumMainnet) {
                networkPic = EthereumPic
            } else if (this.props.network === chainIDs.AvalancheMainnet) {
                networkPic = AvalanchePic
            } else if (this.props.network === chainIDs.OptimismMainnet) {
                networkPic = OptimismPic
            } else if (this.props.network === chainIDs.ArbitrumMainnet) {
                networkPic = ArbitrumPic
            }
            const body = document.getElementsByTagName('body')
            const App = document.getElementsByClassName('App')
            const MainText = document.getElementsByClassName('main-text')
            const HeaderBoxes = document.getElementsByClassName('header_boxes')
            const NumberOfWills = document.getElementsByClassName('number-of-wills')
            const _container = document.getElementsByClassName('_container')
            const blockTwo = document.getElementsByClassName('block-two')
            const blockThree = document.getElementsByClassName('block-three')
            const pageData = document.getElementsByClassName('page-data')
            const your_inheritances = document.getElementsByClassName('your_inheritances_ul')
            //for show confirm
            const modalContent = document.getElementsByClassName('modal-content')
            const modalConfirm = document.getElementsByClassName('modal-confirm')
            const modalConfirmText = document.getElementsByClassName('modal-confirm_text')
            const modalConfirmH2 = document.getElementsByClassName('modal-confirm_h2')
            const modalConfirmLoader = document.getElementsByClassName('ml-loader')
            //for done modal
            const modalDone = document.getElementsByClassName('modal-await')
            const modalAwaitText = document.getElementsByClassName('modal-await_text')
            const imageInModalDone = document.getElementById('modal-done-image')
            body[0].addEventListener('click', (event) => {
                const exist = document.getElementsByClassName('fade will-block modal show')
                if (
                    (this.state.show)
                    &&
                    (
                        event.target === App[0]
                        ||
                        event.target === MainText[0]
                        ||
                        event.target === HeaderBoxes[0]
                        ||
                        event.target === NumberOfWills[0]
                        ||
                        event.target === _container[0]
                        ||
                        event.target === blockTwo[0]
                        ||
                        event.target === blockTwo[1]
                        ||
                        event.target === blockThree[0]
                        ||
                        event.target === pageData[0]
                        ||
                        event.target === exist[0]
                    )
                ) {
                    this.handleClose()
                }
                if (
                    this.state.showConfirm
                    &&
                    event.target !== modalContent[0]
                    &&
                    event.target !== modalContent[1]
                    &&
                    event.target !== modalConfirm[0]
                    &&
                    event.target !== modalConfirmText[0]
                    &&
                    event.target !== modalConfirmH2[0]
                    &&
                    event.target !== modalConfirmLoader[0]

                ) {
                    this.handleCloseConfirm()
                }
                if (
                    this.state.newWillDone
                    &&
                    event.target !== modalDone[0]
                    &&
                    event.target !== modalAwaitText[0]
                    &&
                    event.target !== modalContent[0]
                    &&
                    event.target !== imageInModalDone
                ) {
                    this.handleCloseDoneNewWill()
                }

            })
            this.setState({ signer, signerAddress, contract, networkPic })
        } catch (error) {
            console.error(error)
        }
    }

    getTokensLists() {
        if (this.props.network === chainIDs.BinanceMainnet) {
            return BinanceMainnetTokens.tokens
        } else if (this.props.network === chainIDs.Polygon) {
            return UniswapTokens.tokens.filter((v) => v.chainId === chainIDs.Polygon)
        } else if (this.props.network === chainIDs.EthereumMainnet) {
            return UniswapTokens.tokens.filter((v) => v.chainId === chainIDs.EthereumMainnet)
        } else if (this.props.network === chainIDs.Mumbai) {
            return MumbaiTokens.tokens
        } else if (this.props.network === chainIDs.Goerli) {
            return GoerliTokens.tokens
        } else if (this.props.network === chainIDs.BinanceTestnet) {
            return BinanceTestnetTokens.tokens
        } else if (this.props.network === chainIDs.AvalancheMainnet) {
            return AvalancheTokens.tokens.filter((v) => v.chainId === chainIDs.AvalancheMainnet)
        } else if (this.props.network === chainIDs.OptimismMainnet) {
            return UniswapTokens.tokens.filter((v) => v.chainId === chainIDs.OptimismMainnet)
        } else if (this.props.network === chainIDs.ArbitrumMainnet) {
            return UniswapTokens.tokens.filter((v) => v.chainId === chainIDs.ArbitrumMainnet)
        }
        return []
    }

    async approve() {
        try {
            const { contractAddress, signer, tokensValue } = this.state
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            this.handleShowConfirm()
            const symbol = await _token.symbol()
            await _token.approve(contractAddress, ethers.constants.MaxUint256)
                .then(async (tx) => {
                    this.handleShowAwait(`Approve ${symbol}`)
                    await tx.wait()
                        .then(() => {
                            this.handleCloseAwait()
                            this.handleShowEventConfirmed(`Approved ${symbol}`, tx.hash)
                            setTimeout(() => {
                                this.handleCloseEventConfirmed()
                            }, 5000)
                            this.setState({
                                approved: true
                            })
                        })
                })
                .catch(err => {
                    console.log(err)
                    if (err.message.includes('resolver or addr is not') || err.reason.includes('resolver or addr is not')) {
                        console.log('err')
                        this.handleShowError('Choose token')
                    }
                    setTimeout(() => {
                        this.handleCloseError()
                    }, 5000)
                    this.handleCloseConfirm()
                    this.handleCloseAwait()
                })
        } catch (error) {
            console.log(error)
        }
    }

    createTime() {
        try {
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
        } catch (error) {
            if (
                (this.state.year === '' || this.state.month === '' || this.state.day === '')
                ||
                (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
                ||
                (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
            ) { } else {
                this.handleShowError('Something wrong with time')
                setTimeout(() => {
                    this.handleCloseError()
                }, 5000)
            }
        }
    }

    async newWill() {
        try {
            const { contract, heirAddress, amount, isUnlimitedAmount, tokensValue, signer } = this.state
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            let date = this.createTime()
            let timeUnixWhenWithdraw = 0;
            timeUnixWhenWithdraw = Math.floor(date.getTime() / 1000)
            let sendTo = isUnlimitedAmount === true ? ethers.constants.MaxUint256 : BigInt(amount * Math.pow(10, await _token.decimals())).toString()
            this.handleShowConfirm()
            await contract.addNewWill(heirAddress, tokensValue, timeUnixWhenWithdraw.toString(), sendTo)
                .then(async (tx) => {
                    this.handleShowAwait('New dWill creation')
                    await tx.wait()
                    this.handleCloseAwait()
                    this.handleClose()
                    this.handleShowDoneNewWill(tx.hash)
                    setTimeout(() => {
                        this.handleCloseDoneNewWill()
                    }, 5000)
                })
        } catch (error) {
            console.error(error)
            if (error.message.includes('cannot estimate gas; transaction may fail or may require manual gas limit')) {
                this.handleShowError(
                    'Something went wrong. Maybe you have already bequeathed all your tokens or you are trying to bequeath all tokens to one address when there is already some amount for another.'
                )
            }
            if (error.message.includes('resolver or addr is not configured')) {
                this.handleShowError('Добавьте адрес')
            }
            if (error.message.includes('invalid BigNumber string')) {
                this.handleShowError('Введите время правильно')
            }
            if (error.message.includes('user rejected transaction')) { }
            if (error.message.includes('Not enough allowance')) {
                this.handleShowError('Not enough allowance')
            }
            setTimeout(() => {
                this.handleCloseError()
            }, 5000)
            this.handleCloseConfirm()
            this.handleCloseAwait()
        }
    }

    async onChangeAmount(event) {
        try {
            const { contractAddress, signer, signerAddress, tokensValue, contract } = this.state
            if (tokensValue === '') throw Error('resolver or addr is not configured')
            if (parseFloat(event.target.value) >= 0) {
                this.setState({
                    amount: event.target.value
                })
            }
            if (event.target.value === '') {
                this.setState({
                    amount: ''
                })
            }
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            const allowance = await _token.allowance(signerAddress, contractAddress)
            if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
                this.setState({
                    approved: true
                })
            } else {
                const decimals = await _token.decimals()
                const allWillsAmountThisToken = await contract.getAllWillsAmountThisToken(signerAddress, _token.address)
                this.changeApproved(
                    BigInt(allowance),
                    BigInt(allWillsAmountThisToken) + BigInt(event.target.value * Math.pow(10, decimals)),
                    decimals
                )
            }
        } catch (error) {
            if (error.message.includes('resolver or addr is not configured')) {
                if (this.state.contractAddress === '') {
                    this.handleShowError(`dWill not exist on this network`)
                }
                if (this.state.tokensValue === '') {
                    this.handleShowError('Choose token')
                }
            }
            setTimeout(() => {
                this.handleCloseError()
            }, 5000)
        }
    }

    async onChangeUnlimitedAmount() {
        try {
            const { contractAddress, signer, signerAddress, tokensValue, isUnlimitedAmount } = this.state
            //max amount uint256
            this.setState({
                amount: isUnlimitedAmount === false ? ethers.constants.MaxUint256.toString() : '',
                isUnlimitedAmount: isUnlimitedAmount === true ? false : true,
                limitedText: isUnlimitedAmount === true ? 'limited by' : 'unlimited'
            })
            const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
            const allowance = await _token.allowance(signerAddress, contractAddress)
            if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
                this.setState({
                    approved: true
                })
            } else {
                this.changeApproved(BigInt(allowance), BigInt(this.state.amount))
            }
        } catch (error) {
            console.error(error)
            if (error.message.includes('resolver or addr is not configured')) {
                // this.setState({
                //     amount: '',
                //     isUnlimitedAmount: false
                // })
                // this.handleShowError('Выберите токен')
            }
            setTimeout(() => {
                this.handleCloseError()
            }, 5000)
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
                if (allowance.toString() === ethers.constants.MaxUint256.toString()) {
                    this.setState({
                        approved: true
                    })
                } else {
                    this.changeApproved(
                        BigInt(allowance),
                        BigInt(balance) + BigInt(allWillsAmountThisToken),
                        decimals
                    )
                }
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
            if (event.value === '') throw Error('token not exist here')
            const _token = new ethers.Contract(event.value, ERC20.abi, signer)
            this.setState({
                tokensValue: event.value
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
            console.log(error.message)
            if (error.message.includes('resolver or addr is not configured')) {
                if (this.state.contractAddress === '') {
                    this.handleShowError('dWill not exist on this network')
                }
            } else if (error.message.includes('token not exist here')) {
                this.handleShowError('Not existed token')
            }
            setTimeout(() => {
                this.handleCloseError()
            }, 5000)
        }
    }

    disableAmountInput() {
        return this.state.tokensValue === '';
    }

    onChangeYear(event) {
        this.setState({
            year: parseInt(event.target.value)
        }, () => {
            this.createTime()
        })
    }

    onChangeMonth(event) {
        this.setState({
            month: parseInt(event.target.value)
        }, () => {
            this.createTime()
        })
    }

    onChangeDay(event) {
        this.setState({
            day: parseInt(event.target.value)
        }, () => {
            this.createTime()
        })
    }

    onChangeHeirAddress(event) {
        this.setState({
            heirAddress: event.target.value,
            isAddress: ethers.utils.isAddress(event.target.value)
        }, () => {
            console.log(this.state.isAddress)
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

    changeDelivery() {
        this.createTime()
        this.setState({
            deliveryOn: this.state.deliveryOn === true ? false : true
        })
    }

    changeMessage() {
        this.createTime()
        this.setState({
            messageOn: this.state.messageOn === true ? false : true
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
    changeDelivery = this.changeDelivery.bind(this)
    changeMessage = this.changeMessage.bind(this)

    handleClose = () => this.setState({
        show: false,
        amount: '0',
        approved: false,
        year: 2,
        month: 0,
        day: 0,
        heirAddress: '',
        isUnlimitedAmount: true,
        amount: ethers.constants.MaxUint256.toString(),
        tokensValue: '',
        limitedText: 'unlimited'
    });
    handleShow = () => {
        this.setState({ show: true })
    };

    handleClose = this.handleClose.bind(this)
    handleShow = this.handleShow.bind(this)

    handleShowConfirm = () => this.setState({ showConfirm: true })
    handleShowAwait = (processingText) => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showConfirm: false, showAwait: true, processingText })
    }
    handleCloseConfirm = () => this.setState({ showConfirm: false })
    handleCloseAwait = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.remove('small-modal')
        this.setState({ showAwait: false })
    }
    handleShowConfirm = this.handleShowConfirm.bind(this)
    handleShowAwait = this.handleShowAwait.bind(this)
    handleCloseConfirm = this.handleCloseConfirm.bind(this)
    handleCloseAwait = this.handleCloseAwait.bind(this)

    handleShowError = (errortext) => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showError: true, errortext })
    }
    handleCloseError = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.remove('small-modal')
        this.setState({ showError: false })
    }

    handleShowError = this.handleShowError.bind(this)
    handleCloseError = this.handleCloseError.bind(this)

    handleShowWalletNotExist = () => this.setState({ showWalletNotExist: true })
    handleCloseWalletNotExist = () => this.setState({ showWalletNotExist: false })

    handleShowWalletNotExist = this.handleShowWalletNotExist.bind(this)
    handleCloseWalletNotExist = this.handleCloseWalletNotExist.bind(this)

    handleShowDoneNewWill = (hash) => this.setState({ newWillDone: true, hash })
    handleCloseDoneNewWill = () => this.setState({ newWillDone: false })

    handleShowDoneNewWill = this.handleShowDoneNewWill.bind(this)
    handleCloseDoneNewWill = this.handleCloseDoneNewWill.bind(this)

    handleShowEventConfirmed = (confirmedText, hash) => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showEventConfirmed: true, confirmedText, hash })
    }
    handleCloseEventConfirmed = () => {
        const body = document.getElementsByTagName('body')
        body[0].classList.add('small-modal')
        this.setState({ showEventConfirmed: false })
    }

    handleShowEventConfirmed = this.handleShowEventConfirmed.bind(this)
    handleCloseEventConfirmed = this.handleCloseEventConfirmed.bind(this)

    render() {
        return (
            <><div>
                <Button id="newwill-button" variant="primary" className="btn-new-will" onClick={this.props.isEthereumNull === false ? this.handleShow : this.handleShowWalletNotExist}>
                    New dWill
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
                <Modal id="willmodal" show={this.state.show} className='will-block' style={styles.modal_new_will}>
                    <div className="will-block__wrapper">
                        <Modal.Header className='modal_new_will'>
                            <Button className='bnt_close' onClick={this.handleClose}>
                                <img src={buttonClosePic} alt="close" />
                            </Button>
                            <Modal.Title className='modal_title'>New dWill</Modal.Title>
                            <hr />
                        </Modal.Header>
                        <Modal.Body>
                            <div className="modal-body__row">
                                <div className="your-wills__header">
                                    <div>
                                        Я завещаю свои
                                    </div>
                                    {
                                        <Select styles={select} name="tokens" onChange={this.onChangeTokens} options={
                                            this.getTokensLists().map((v) => {
                                                return {
                                                    value: v.address,
                                                    label: v.symbol,
                                                    icon: v.logoURI
                                                }
                                            })
                                        }
                                            components={{ Option: IconOption }} />
                                    }
                                    {/* <br></br> */}
                                    {
                                        this.state.tokensValue === ''
                                            ?
                                            null
                                            :
                                            <div className="your-wills__count">
                                                <span>в количестве</span>
                                                <div className="your-wills__checkbox">
                                                    <input disabled={this.state.tokensValue === ''} id="unlimited" type="checkbox" onChange={this.onChangeUnlimitedAmount} checked={this.state.isUnlimitedAmount} className="form-check-input mt-0" />
                                                    <label htmlFor="unlimited">{this.state.limitedText}</label><br />
                                                </div>
                                                <div style={{ display: this.state.isUnlimitedAmount === false ? 'block' : 'none' }} className="your-wills__max mt-0">
                                                    <input disabled={this.disableAmountInput()} onChange={this.onChangeAmount} value={this.state.amount} min="0" placeholder="Введите сумму" type="number" className="input-group mb-3" />
                                                    <Button variant="outline-success" disabled={this.disableAmountInput()} onClick={this.onSetMaxAmount}>
                                                        All
                                                    </Button>
                                                </div>
                                                <div className="your-wills__info-message" data-title={tooltipText.tokens}>
                                                    <img src={infoBtn}></img>
                                                </div>
                                            </div>
                                    }

                                </div>
                            </div>
                            <div className='modal-body__row modal-body__row-direction'>с кошелька <a href={`${this.props.networkProvider}/address/${this.state.signerAddress}`} target="_blank" rel="noreferrer" className='modal_wallet_link'>{this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)}</a> на сети <i className="br"></i> {this.props.networkName}
                                <img src={this.state.networkPic} alt="networkpic" />
                                <div className="your-wills__info-message" data-title={tooltipText.network}>
                                    <img src={infoBtn}></img>
                                </div></div>
                            <div className="your-wills__wallet modal-body__row">
                                <div className="your-wills__wallet-row">
                                    Доверенному кошельку
                                    <div className="your-wills__info-message" data-title={tooltipText.wallet}>
                                        <img src={infoBtn}></img>
                                    </div>
                                </div>
                                <input onChange={this.onChangeHeirAddress} value={this.state.currentEditHeirAddress} className="input-group mb-3" required="required" />
                                <p style={{ display: this.state.isAddress ? 'none' : 'block' }}>Неправильный формат адреса</p>
                            </div>
                            <div className="modal-body__row">

                                <div className='modal_title-time-will'>{"При условии что я буду неактивен более чем:"}

                                </div>
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
                                    <div className="your-wills__info-message" data-title={tooltipText.time}>
                                        <img src={infoBtn}></img>
                                    </div>
                                </div>

                            </div>
                            <div className="your-wills__settings">
                                <div className="will-date__row will-date__row--checkbox">
                                    <div className="will-date__row-input">
                                        <input id="wills-set1" type="checkbox" onChange={this.changeMessage} disabled={true} className="form-check form-check-input mt-0" />
                                        <label htmlFor="wills-set1">Add NFT Message (coming soon)</label>
                                    </div>
                                    <div className="your-wills__info-message" data-title={tooltipText.NFTMessage}>
                                        <img src={infoBtn}></img>
                                    </div><br />
                                </div>
                                <div className="your-wills__notifications" style={this.state.messageOn === true ? { display: 'block' } : { display: 'none' }}>
                                    <span>Сообщение хранится в зашифрованном виде и может быть прочитано получателем
                                        только в момент получения завещания</span>
                                    <textarea placeholder="NFT message"></textarea>
                                </div>
                                <div className="will-date__row will-date__row--checkbox">
                                    <div className="will-date__row-input">
                                        <input id="wills-set2" type="checkbox" onChange={this.changeDelivery} disabled={true} className="form-check form-check-input mt-0" />
                                        <label htmlFor="wills-set2">Automatic token delivery (coming soon)</label><br />
                                    </div>
                                    <div className="your-wills__info-message" data-title={tooltipText.delivery}>
                                        <img src={infoBtn}></img>
                                    </div><br />
                                </div>
                                <div className="your-wills__notifications" style={this.state.deliveryOn === true ? { display: 'block' } : { display: 'none' }}>
                                    <span>После того как условие будет выполнено завещанные токены будут автоматически отправлены
                                        на доверенный кошелек (10 USDT)</span>
                                </div>
                                <div className="will-date__row will-date__row--checkbox">
                                    <div className="will-date__row-input">
                                        <input id="wills-set3" type="checkbox" onChange={this.changeNotifications} disabled={false} className="form-check form-check-input mt-0" />
                                        <label htmlFor="wills-set3">Notifications</label><br />
                                    </div>
                                    <div className="your-wills__info-message" data-title={tooltipText.notifications}>
                                        <img src={infoBtn}></img>
                                    </div><br />
                                </div>
                                <div className="your-wills__notifications" style={this.state.notificationsOn === true ? { display: 'block' } : { display: 'none' }}>
                                    <span>Настройте оповещения в Telegram, Email или Google Calendar и dWill оповестит вас всех важных событиях
                                        связанных с вашими завещаниями и завещаниям предназначенным для вас</span>
                                    <a href="https://t.me/thewill_bot" rel="noreferrer" className="your-wills__links">
                                        <img src={btnTelegram}></img>
                                        <img src={btnEmail}></img>
                                        <span>Настроить оповещения в телеграм и на email</span>
                                    </a>
                                    <div className="your-wills__links">
                                        <a href={`http://www.google.com/calendar/event?action=TEMPLATE&text=${'dWill notification. dWill time expired.'}&dates=${this.state.googleCalendarDateText}/${this.state.googleCalendarDateText}&details=${`<div><b>ℹ️ dWill notification:</b></div><br/><div>The time to unlock the dWill has expired.</div><br/<div>Heir: <a href="${this.props.networkProvider + '/address/' + this.state.heirAddress}">${this.state.heirAddressShort}</a></div><br/><br/><div>You can see more info on our website.</div><br/><a href="https://dwill.app"><b>dWill.app</b></a>`}&trp=false&sprop=&sprop=name:`} target="_blank" rel="noreferrer"><img src={btnCalendar}></img>Добавить событие в Google Calendar</a>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <div>
                                <ul className="your-wills__footer">
                                    <li>
                                        <Button variant="primary" disabled={
                                            (this.state.approved === true)
                                            ||
                                            (this.state.isAddress === false)
                                            ||
                                            (this.state.amount === '0')
                                            ||
                                            (this.state.amount === '')
                                            ||
                                            (this.state.tokensValue === '')
                                            ||
                                            (this.state.heirAddress === '')
                                            ||
                                            (this.state.year === '' || this.state.month === '' || this.state.day === '')
                                            ||
                                            (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
                                            ||
                                            (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
                                        } onClick={
                                            this.state.approved !== false
                                                ||
                                                (this.state.amount !== '0')
                                                ||
                                                (this.state.amount !== '')
                                                ||
                                                (this.state.heirAddress !== '')
                                                ||
                                                (this.state.isAddress === true)
                                                ||
                                                (this.state.tokensValue === '')
                                                ||
                                                (this.state.year !== '' || this.state.month !== '' || this.state.day !== '')
                                                ||
                                                (this.state.year !== 0 && this.state.month !== 0 && this.state.day !== 0)
                                                ||
                                                (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
                                                ? this.approve : null} style={
                                                    {
                                                        "background":
                                                            (this.state.approved === true)
                                                                ||
                                                                (this.state.amount === '0')
                                                                ||
                                                                (this.state.amount === '')
                                                                ||
                                                                (this.state.tokensValue === '')
                                                                ||
                                                                (this.state.heirAddress === '')
                                                                ||
                                                                (this.state.isAddress === false)
                                                                ||
                                                                (this.state.year === '' || this.state.month === '' || this.state.day === '')
                                                                ||
                                                                (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
                                                                ||
                                                                (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
                                                                ? '#3E474F' : '#5ED5A8'
                                                    }
                                                } >
                                            Approve
                                        </Button>
                                        <div className="your-wills__info-message" data-title={tooltipText.approve}>
                                            <img src={infoBtn}></img>
                                        </div>
                                    </li>
                                    <li>
                                        <Button variant="primary" disabled={
                                            (this.state.approved === false)
                                            ||
                                            (this.state.amount === '0')
                                            ||
                                            (this.state.amount === '')
                                            ||
                                            (this.state.heirAddress === '')
                                            ||
                                            (this.state.isAddress === false)
                                            ||
                                            (this.state.tokensValue === '')
                                            ||
                                            (this.state.year === '' || this.state.month === '' || this.state.day === '')
                                            ||
                                            (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
                                            ||
                                            (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
                                        } onClick={
                                            this.state.approved === false
                                                ||
                                                (this.state.amount === '0')
                                                ||
                                                (this.state.amount === '')
                                                ||
                                                (this.state.heirAddress === '')
                                                ||
                                                (this.state.isAddress === false)
                                                ||
                                                (this.state.tokensValue === '')
                                                ||
                                                (this.state.year === '' || this.state.month === '' || this.state.day === '')
                                                ||
                                                (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
                                                ||
                                                (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
                                                ? null : this.newWill} style={
                                                    {
                                                        "background":
                                                            (this.state.approved === false)
                                                                ||
                                                                (this.state.amount === '0')
                                                                ||
                                                                (this.state.amount === '')
                                                                ||
                                                                (this.state.isAddress === false)
                                                                ||
                                                                (this.state.heirAddress === '')
                                                                ||
                                                                (this.state.tokensValue === '')
                                                                ||
                                                                (this.state.year === '' || this.state.month === '' || this.state.day === '')
                                                                ||
                                                                (this.state.year === 0 && this.state.month === 0 && this.state.day === 0)
                                                                ||
                                                                (isNaN(parseInt(this.state.year)) || isNaN(parseInt(this.state.month)) || isNaN(parseInt(this.state.day)))
                                                                ? '#3E474F' : '#5ED5A8'
                                                    }}
                                            className='button_make-new-will'>
                                            <span className="button_number-span">Make new dWill </span>
                                        </Button>

                                    </li>
                                </ul>
                                {/* <Button className="btn-close-modal" onClick={this.handleCloseEdit}>

                            </Button> */}
                            </div>
                        </Modal.Footer>
                    </div>


                </Modal>
            </div>
                <Modal id='modal_confirm' show={this.state.showConfirm} className="modal-confirm">
                    <Modal.Header>
                        <h2 className='modal-confirm_h2'>Pending  transaction</h2>
                    </Modal.Header>
                    {/* <img className="spinner" src={LoadingPic} /> */}
                    <div className="ml-loader">
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
                        <a className="modal-loading__link" href={`${this.props.networkProvider}/tx/${this.state.hash}`} target="_blank" rel="noreferrer">
                            <img src={linkBtn}></img>
                        </a>
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
                    <img id="modal-done-image" src={ConfiPic} alt="confi" />
                    <Modal.Footer>
                        <button className="btn-close-modal btn btn-primary" onClick={this.handleCloseDoneNewWill}>
                            <img src={closeModalPic}></img>
                        </button>
                        <p className="modal-await_text">Завещание успешно создано!</p>
                        <p className="modal-await_text modal-await_text__second">
                            <a href={`${this.props.networkProvider}/tx/${this.state.hash}`} target="_blank" rel="noreferrer">
                                View in blockchain explorer
                            </a>
                        </p>
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
                            <div className="modal-loading__subtitle">{this.state.errortext}</div>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--error">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" className="btn btn-danger" onClick={this.handleCloseError}>
                            <img src={closePic} alt="close" />
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className='overlay'></div></>
        )
    }
}

export default NewWill 
