import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import TheWill from '../Contract/TheWill.json'
import LoadingPic from '../content/loading.svg'
import closeModalPic from '../content/close_modal.svg'
import ConfiPic from '../content/confi.svg'
import closePic from '../content/button_close.svg'
import linkBtn from '../content/link-btn.png'
import { ethers } from "ethers"


class ResetTimers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signer: null,
            signerAddress: '',
            contractAddress: props.contractAddress,
            contract: null,
            showConfirm: false,
            showAwait: false,
            showEventConfirmed: false,
            showError: false,
            processingText: '',
            confirmedText: '',
        };
    }

    componentDidMount = async () => {
        try {
            const signer = this.props.signer
            const signerAddress = this.props.signerAddress
            const contract = new ethers.Contract(this.props.contractAddress, TheWill.abi, signer)
            this.setState({ signer, signerAddress, contract })
            const body = document.getElementsByTagName('body')
            const App = document.getElementsByClassName('App')
            const MainText = document.getElementsByClassName('main-text')
            const HeaderBoxes = document.getElementsByClassName('header_boxes')
            const NumberOfWills = document.getElementsByClassName('number-of-wills')
            const _container = document.getElementsByClassName('_container')
            const blockTwo = document.getElementsByClassName('block-two')
            const blockThree = document.getElementsByClassName('block-three')
            const pageData = document.getElementsByClassName('page-data')
            //for show confirm
            const modalContent = document.getElementsByClassName('modal-content')
            const modalConfirm = document.getElementsByClassName('modal-confirm')
            const modalConfirmText = document.getElementsByClassName('modal-confirm_text')
            const modalConfirmH2 = document.getElementsByClassName('modal-confirm_h2')
            const modalConfirmLoader = document.getElementsByClassName('ml-loader')
            body[0].addEventListener('click', (event) => {
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
                    &&
                    event.target.id !== 'reset-timers'
                    &&
                    event.target.id !== 'reset-timersh2'
                    &&
                    event.target.id !== 'reset-timersh3'
                ) {
                    console.log(event.target)
                    this.handleCloseConfirm()
                }
            })
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
                this.handleShowAwait('Reset timers')
                return tx.wait()
            })
            .then(() => {
                this.handleCloseAwait()
                this.handleShowEventConfirmed('Timers has been reseted')
            })
            .catch((err) => {
                console.error(err)
                this.handleCloseConfirm()
                this.handleCloseAwait()
                this.handleShowError('Something went wrong')
            })
    }

    resetTimers = this.resetTimers.bind(this)

    handleClose = () => this.setState({ show: false });
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

    handleShowEventConfirmed = (confirmedText) => this.setState({ showEventConfirmed: true, confirmedText })
    handleCloseEventConfirmed = () => this.setState({ showEventConfirmed: false })

    handleShowEventConfirmed = this.handleShowEventConfirmed.bind(this)
    handleCloseEventConfirmed = this.handleCloseEventConfirmed.bind(this)

    handleShowError = (errortext) => this.setState({ showError: true, errortext })
    handleCloseError = () => this.setState({ showError: false })

    handleShowError = this.handleShowError.bind(this)
    handleCloseError = this.handleCloseError.bind(this)

    render() {
        return (
            <div>
                <Button id='reset-timers' variant="primary" className="btn_reset-timers" onClick={this.resetTimers}>
                    <h2 id='reset-timersh2' className='btn_reset-timers-h2'>RESET TIMERS</h2>
                    <h3 id='reset-timersh3' className='btn_reset-timers-h3'>I'm active, and I still have access to my wallet</h3>
                </Button>
                <Modal show={this.state.showConfirm} className="modal-confirm">
                    <Modal.Header>
                        <h2 className='modal-confirm_h2'>Pending  transaction</h2>
                    </Modal.Header>
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
                        <button className="btn-close-modal btn btn-primary">
                            <img src={closeModalPic}></img>
                        </button>
                    </Modal.Footer>
                </Modal>
                {/* <Modal show={this.state.showAwait} className="modal-await">
                    <img src={ConfiPic} />
                    <Modal.Footer>
                        <button className="btn-close-modal btn btn-primary">
                            <img src={closeModalPic}></img>
                        </button>
                        <p className="modal-await_text">Завещание успешно создано!!!!</p>
                    </Modal.Footer>
                </Modal> */}
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
                        <a className="modal-loading__link" href="">
                            <img src={linkBtn}></img>
                        </a>
                        <Button variant="danger" onClick={this.handleCloseEventConfirmed} className="btn btn-danger">
                            <img src={closePic} />
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal className="modal-loading modal-loading--process" show={this.state.showAwait}>
                    <Modal.Header>
                        <div className="className='modal_confirm">
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
                        <Button variant="danger" className="btn btn-danger" onClick={this.handleCloseError}>
                            <img src={closePic} alt="close" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default ResetTimers;