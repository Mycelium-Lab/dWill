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
            year: '',
            month: '',
            day: '',
            heirAddress: '',
            contract: null,
            showConfirm: false,
            showAwait: false,
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
        const { contractAddress, signer, amount, tokensValue } = this.state
        const _token = new ethers.Contract(tokensValue, ERC20.abi, signer)
        this.handleShowConfirm()
        await _token.increaseAllowance(contractAddress, ethers.utils.parseEther(amount))
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
                console.error(err)
                this.handleCloseConfirm()
                this.handleCloseAwait()
            })
    }

    async newWill() {
        try {
            const { contract, heirAddress, amount, tokensValue, year, month, day } = this.state
            const secondsInADay = 86400
            let timeWhenWithdraw = (new Date()).getTime();
            timeWhenWithdraw = Math.round(timeWhenWithdraw / 1000) + parseInt(year) * 365 * secondsInADay + parseInt(month) * 30 * secondsInADay + parseInt(day) * secondsInADay;
            this.handleShowConfirm()
            await contract.addNewWill(heirAddress, tokensValue, timeWhenWithdraw, ethers.utils.parseEther(amount))
                .then(async (tx) => {
                    this.handleShowAwait()
                    await tx.wait()
                    this.handleCloseAwait()
                    this.handleClose()
                })
        } catch (error) {
            console.error(error)
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

    handleShowConfirm = () => this.setState({showConfirm: true})
    handleShowAwait = () => this.setState({showConfirm: false, showAwait: true})
    handleCloseConfirm = () => this.setState({showConfirm: false})
    handleCloseAwait = () => this.setState({showAwait: false})
    handleShowConfirm = this.handleShowConfirm.bind(this)
    handleShowAwait = this.handleShowAwait.bind(this)
    handleCloseConfirm = this.handleCloseConfirm.bind(this)
    handleCloseAwait = this.handleCloseAwait.bind(this)

    render() {
        return(
        <div>
            <Button variant="primary" className="btn-new-will" onClick={this.handleShow}>
                New Will
            </Button>
            
            <Modal show={this.state.show} onHide={this.handleClose} className='modal_content' style={styles.modal_new_will}>
                <Modal.Header className='modal_new_will'>
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
                    </select>
                    <div>
                    </div>
                        <input onChange={this.onChangeAmount} className="input-group-mb-3"/>
                        <Button variant="outline-success" className='input-group-mb-3-button'>
                            max
                        </Button>
                    </div>
                    <div className='modal_wallet'>С кошелька <a href='#'className='modal_wallet_link'>{
                        this.state.signerAddress.slice(0, 6) + '...' + this.state.signerAddress.slice(this.state.signerAddress.length - 4, this.state.signerAddress.length)
                        }</a> на сети {this.state.network}</div>
                        <span className='title_trusted-wallet'>Доверенному кошельку</span>
                        <div><input onChange={this.onChangeHeirAddress} className="input_trusted-wallet"/></div>
                    <div>
                        <div className='modal_title-time-will'>{"При условии что я буду неактивен(неактивна) более чем:"}</div>
                        <div className='modal_time-will'>
                            <div className='modal_time-years'>
                            <input type="number" onChange={this.onChangeYear} className="input-group-time"/>
                            <label className="input-group-time-name" >Лет</label><br/>
                            </div>
                            <div className='modal_time-months'>
                            <input type="number" onChange={this.onChangeMonth} className="input-group-time"/>
                            <label className="input-group-time-name" >Месяцев</label><br/>
                            </div>
                            <div className='modal_time-days'>
                            <input type="number" onChange={this.onChangeDay} className="input-group-time"/>
                            <label className="input-group-time-name" >Дней</label><br/> 
                            </div>
                        </div>
                    </div>
                    <div className='modal_checkbox'>
                        <input type="checkbox" className="modal_checkbox-add-nft"/>
                        <label >Add NFT Message</label><br/>
                        <input type="checkbox" disabled={true} className="form-check-input mt-0"/>
                        <label >Automatic token delivery (coming soon)</label><br/>
                        <input type="checkbox" disabled={true} className="form-check-input mt-0"/>
                        <label >Notifications (coming soon)</label><br/>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={this.state.approved == false ? this.approve : this.newWill} className='button_make-new-will'>
                    {this.state.approved == false ? "Approve": "Make new will"}
                </Button>
                <Button onClick={this.handleClose}>
                    x
                </Button>
                </Modal.Footer>
                <div className='overlay'></div>
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
            <div className='overlay'></div>
        </div>
        
        )
    }
}

export default NewWill 