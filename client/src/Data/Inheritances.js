import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'
import closePic from '../content/button_close.svg'

import { ethers } from "ethers";

import ERC20 from '../Contract/ERC20.json'
import { chainIDs, TheWillAddress, UnlimitedAmount } from '../Utils/Constants';

class Inheritances extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            tokenAddress: '',
            network: '',
            approved: false,
            tokensValue: '',
            contractAddress: props.contractAddress,
            year: '',
            month: '',
            day: '',
            heirAddress: '',
            contract: null,
            inheritances: [],
            showConfirm: false,
            showAwait: false,
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(this.props.contractAddress, TheWill.abi, signer)
            const inheritances = await contract.getAllInheritances(signerAddress)
            let _inheritances = [];
            for (let i = 0; i < inheritances.length; i++) {
                const token = new ethers.Contract(inheritances[i].token, ERC20.abi, signer)
                const symbol = await token.symbol()
                const decimals = await token.decimals()
                _inheritances[i] = {
                    ID: inheritances[i].ID.toString(),
                    amount: inheritances[i].amount.toString(),
                    done: inheritances[i].done,
                    heir: inheritances[i].heir,
                    owner: inheritances[i].owner,
                    timeWhenWithdraw: inheritances[i].timeWhenWithdraw.toString(),
                    token: inheritances[i].token,
                    symbol,
                    decimals
                }
            }
            let networkName
            if (this.props.network === chainIDs.BinanceMainnet) {
                networkName = `BNB Chain`
            } else if (this.props.network  === chainIDs.Polygon) {
                networkName = `Polygon`
            } else if (this.props.network  === 31337) {
                networkName = `Hardhat`
            } else if (this.props.network  === chainIDs.Mumbai) {
                networkName = `Mumbai`
            } else if (this.props.network  === chainIDs.Goerli) {
                networkName = `Goerli`
            } else if (this.props.network  === chainIDs.EthereumMainnet) {
                networkName = `Ethereum`
            } else if (this.props.network  === chainIDs.BinanceTestnet) {
                networkName = `BNBTest Chain`
            }
            contract.on('AddAnHeir', async (ID, owner, heir, token, timeWhenWithdraw, amount) => {
                let __inheritances = this.state.inheritances
                if (heir === signerAddress) {
                    const inheritance = await contract.inheritanceData(ID.toString())
                    const token = new ethers.Contract(inheritance.token, ERC20.abi, signer)
                    const symbol = await token.symbol()
                    const decimals = await token.decimals()
                    let exist = false
                    for (let i = 0; i < __inheritances.length; i++) {
                        if (__inheritances[i].ID === inheritance.ID.toString()) {
                            exist = true
                        }
                    }
                    if (exist === false) {
                        __inheritances.push({
                            ID: inheritance.ID.toString(),
                            amount: inheritance.amount.toString(),
                            done: inheritance.done,
                            heir: inheritance.heir,
                            owner: inheritance.owner,
                            timeWhenWithdraw: inheritance.timeWhenWithdraw.toString(),
                            token: inheritance.token,
                            symbol,
                            decimals
                        })
                    }
                    this.setState({ inheritances: __inheritances })
                }
            })
            contract.on('Withdraw', async (ID, owner, heir, timeWhenWithdraw) => {
                let __inheritances = this.state.inheritances
                if (heir === signerAddress) {
                    __inheritances = __inheritances.filter(v => v.ID !== ID.toString())
                    this.setState({ inheritances: __inheritances })
                }
            })
            contract.on('RemoveWill', async (ID, owner, heir) => {
                let __inheritances = this.state.inheritances
                if (heir === signerAddress) {
                    __inheritances = __inheritances.filter(v => v.ID !== ID.toString())
                    this.setState({ inheritances: __inheritances })
                }
            })
            contract.on('UpdateWillTimeWhenWithdraw', (ID, owner, heir, newTime) => {
                if (heir === signerAddress) {
                    let __inheritances = this.state.inheritances
                    for (let i = 0; i < __inheritances.length; i++) {
                        if (__inheritances[i].ID === ID.toString()) {
                            __inheritances[i].timeWhenWithdraw = newTime.toString()
                        }
                    }
                    this.setState({
                        inheritances: __inheritances
                    })
                }
            })
            contract.on('UpdateAnHeir', async (ID, owner, heir) => {
                let __inheritances = this.state.inheritances
                __inheritances = __inheritances.filter(v => v.ID !== ID.toString())
                if (heir === signerAddress) {
                    const inheritance = await contract.inheritanceData(ID.toString())
                    const token = new ethers.Contract(inheritance.token, ERC20.abi, signer)
                    const symbol = await token.symbol()
                    const decimals = await token.decimals()
                    __inheritances.push({
                        ID: inheritance.ID.toString(),
                        amount: inheritance.amount.toString(),
                        done: inheritance.done,
                        heir: inheritance.heir,
                        owner: inheritance.owner,
                        timeWhenWithdraw: inheritance.timeWhenWithdraw.toString(),
                        token: inheritance.token,
                        symbol,
                        decimals
                    })
                }
                this.setState({
                    inheritances: __inheritances
                })
            })
            contract.on('UpdateAmount', (ID, owner, amount) => {
                if (owner === signerAddress) {
                    let __inheritances = this.state.inheritances
                    for (let i = 0; i < __inheritances.length; i++) {
                        if (__inheritances[i].ID === ID.toString()) {
                            __inheritances[i].amount = amount.toString()
                        }
                    }
                    this.setState({
                        inheritances: __inheritances
                    })
                }
            })
            contract.on('ResetTimers', (IDs, owner, newTimes) => {
                let __inheritances = this.state.inheritances
                if (__inheritances[0] !== undefined && __inheritances[0].owner === owner) {
                    for (let i = 0; i < IDs.length; i++) {
                        for (let j = 0; j < __inheritances.length; j++) {
                            if (IDs[i].toString() === __inheritances[j].ID) {
                                __inheritances[j].timeWhenWithdraw = newTimes[i];
                            }
                        }
                    }
                }
                this.setState({
                    inheritances: __inheritances
                })
            })
            this.setState({ signer, signerAddress, contract, inheritances: _inheritances, network: networkName })
        } catch (error) {
            console.error(error)
        }
    }

    async claim(event) {
        const contract = this.state.contract
        try {
            this.handleShowConfirm()
            await contract.withdraw(event.target.value)
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

    remainingTime(timeWhenWithdraw) {
        const _timeNow = new Date()
        const _timeWhenWithdraw = new Date(parseInt(timeWhenWithdraw) * 1000)
        if (_timeWhenWithdraw < _timeNow) {
            return 'Nothing.'
        } else {
            const seconds = Math.floor((new Date(_timeWhenWithdraw - _timeNow)).getTime() / 1000)
            let y = Math.floor(seconds / 31536000);
            let mo = Math.floor((seconds % 31536000) / 2628000);
            let d = Math.floor(((seconds % 31536000) % 2628000) / 86400);
            let h = Math.floor((seconds % (3600 * 24)) / 3600);

            let yDisplay = y > 0 ? y + (y === 1 ? " year, " : " years, ") : " 0 years,";
            let moDisplay = mo > 0 ? mo + (mo === 1 ? " month, " : " months, ") : " 0 months,";
            let dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : " 0 days, ";
            let hDisplay = h > 0 ? h + (h === 1 ? " hour " : " hours ") : " 0 hours";
            return yDisplay + moDisplay + dDisplay + hDisplay;
        }
    }

    checkIfTimeIsEnd(timeWhenWithdraw) {
        const timeNow = (new Date().getTime())
        const timeFrom = (new Date(parseInt(timeWhenWithdraw) * 1000)).getTime()
        if (timeNow > timeFrom) {
            return true
        } else {
            return false
        }
    }

    remainingTime = this.remainingTime.bind(this)
    checkIfTimeIsEnd = this.checkIfTimeIsEnd.bind(this)
    claim = this.claim.bind(this)

    handleShowConfirm = () => this.setState({ showConfirm: true })
    handleShowAwait = () => this.setState({ showConfirm: false, showAwait: true })
    handleCloseConfirm = () => this.setState({ showConfirm: false })
    handleCloseAwait = () => this.setState({ showAwait: false })
    handleShowConfirm = this.handleShowConfirm.bind(this)
    handleShowAwait = this.handleShowAwait.bind(this)
    handleCloseConfirm = this.handleCloseConfirm.bind(this)
    handleCloseAwait = this.handleCloseAwait.bind(this)

    render() {
        return (
            <div className='your_inheritances wills-description-block'>
                {
                    this.state.inheritances.length > 0
                        ?
                        <div className='your_inheritances_ul-btn'>
                            <ul className='your_inheritances_ul'>
                                {
                                    this.state.inheritances.map((v) => {
                                        return (
                                            <li key={v.ID} style={{ "marginBottom": '10px' }}>

                                                <div className='your_inheritances_ul-text'>
                                                    <h3 className='your_inheritances-h3'>Your inheritances</h3>
                                                    <hr />
                                                    <span>id: {v.ID.toString()} </span>
                                                    <span>
                                                        {
                                                            this.remainingTime(v.timeWhenWithdraw) === 'Nothing.'
                                                                ?
                                                                'You '
                                                                :
                                                                `After ${this.remainingTime(v.timeWhenWithdraw)} you `
                                                        }
                                                        can harvest up to {v.amount.toString() === UnlimitedAmount ? 'Unlimited' : (v.amount / Math.pow(10, v.decimals)).toString()} {v.symbol} from wallet</span>
                                                    <a href={`${this.props.networkProvider}${v.owner}`} target="_blank" rel="noreferrer">{` ${v.owner}`} </a>
                                                    on {this.state.network} chain</div>
                                                <div><button value={v.ID.toString()} onClick={this.claim}
                                                    style={{
                                                        display: this.checkIfTimeIsEnd(v.timeWhenWithdraw) ? 'block' : 'none'
                                                    }} className="btn_btn-success">
                                                    Receive</button></div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        :
                        <h4>У вас еще нет активных завещаний.</h4>
                }
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
                {/* <Modal show={this.state.showAwait}>
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
                </Modal> */}
                <Modal className="modal-loading modal-loading--process" show={this.state.showAwait}>
                    <Modal.Header>
                        <div className="className='modal_confirm">
                            <h2 className="modal-loading__title modal-loading__title--processing">Processing...</h2>
                            <p className="modal-loading__subtitle">Approve  &lt;Token&gt;</p>
                            <div className="modal-loading__progress-bar modal-loading__progress-bar--processing">
                                <span></span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.handleCloseConfirm} className="btn btn-danger">
                            <img src={closePic} />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Inheritances;