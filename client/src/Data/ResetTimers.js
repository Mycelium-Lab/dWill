import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";
import { TheWillAddress } from '../Utils/Constants';

class ResetTimers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            contractAddress: TheWillAddress,
            contract: null,
            showConfirm: false,
            showAwait: false,
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(TheWillAddress, TheWill.abi, signer)
            this.setState({ signer, signerAddress, contract })
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
                <img scr='content/confi.svg' alt='confirm'/>  
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
                <img src="content/loading.svg" alt='loading'/>
                <Modal.Footer>
                <p className="modal-await_text">Завещание успешно создано!</p>
                </Modal.Footer>
            </Modal>
        </div>
        )
    }
}

export default ResetTimers ;