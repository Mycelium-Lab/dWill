import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'
import LoadingPic from '../content/loading.svg'
import { ethers } from "ethers";
import { TheWillAddress, TokenAddress } from '../Utils/Constants';

class ResetTimers extends Component {
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

    async resetTimers() {
        const { contract } = this.state
        this.handleShowConfirm()
        await contract.resetTimers()
            .then(async (tx) => {
                this.handleCloseConfirm()
                this.handleShowAwait()
                return tx.wait()
            })
            .then(() => {
                this.handleCloseAwait()
            })
            .catch((err) => {
                console.error(err)
                this.handleCloseConfirm()
                this.handleCloseAwait()
            })
    }

    resetTimers = this.resetTimers.bind(this)

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
            <Button variant="primary" className="btn_reset-timers" onClick={this.resetTimers}>
                <h2 className='btn_reset-timers-h2'>RESET TIMERS</h2>
                <h3 className='btn_reset-timers-h3'>I'm active, and I still have access to my wallet</h3>
            </Button>
            <Modal show={this.state.showConfirm}className="modal-confirm">
            <Modal.Header>
                <h2 className='modal-confirm_h2'>Pending  transaction</h2>
            </Modal.Header>
                <img scr={LoadingPic}/>  
                <Modal.Footer>
                    <p className="modal-confirm_text">Please confirm transaction in your web3 wallet</p>
                </Modal.Footer>
            </Modal>
            <Modal show={this.state.showAwait} className="modal-await">
                <Modal.Header>
                {/* <Button variant="danger" onClick={this.handleCloseAwait} className="btn btn-danger">
                <img src="content/button_close.svg"/>  
                </Button>   */}
                </Modal.Header>
                <img src="content/loading.svg"/>
                <Modal.Footer>
                <p className="modal-await_text">Завещание успешно создано!</p>
                </Modal.Footer>
            </Modal>
        </div>
        )
    }
}

export default ResetTimers ;