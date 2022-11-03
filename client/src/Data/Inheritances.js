import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TheWill from '../Contract/TheWill.json'

import { ethers } from "ethers";

import ERC20 from '../Contract/ERC20.json'
import { TheWillAddress } from '../Utils/Constants';

class Inheritances extends Component {
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
            inheritances: [],
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
            const inheritances = await contract.getAllInheritances(signerAddress)
            let _inheritances = [];
            for (let i = 0; i < inheritances.length; i++) {
                const token = new ethers.Contract(inheritances[i].token, ERC20.abi, signer)
                const symbol = await token.symbol()
                _inheritances[i] = {
                    ID: inheritances[i].ID.toString(),
                    amount: inheritances[i].amount.toString(),
                    done: inheritances[i].done,
                    heir: inheritances[i].heir,
                    owner: inheritances[i].owner,
                    timeWhenWithdraw: inheritances[i].timeWhenWithdraw.toString(),
                    token: inheritances[i].token,
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
            contract.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
                let __inheritances = this.state.inheritances
                if (heir == signerAddress) {
                    const inheritance = await contract.inheritanceData(ID.toString())
                    const token = new ethers.Contract(inheritance.token, ERC20.abi, signer)
                    const symbol = await token.symbol()
                    let exist = false
                    for (let i = 0; i < __inheritances.length; i++) {
                        if (__inheritances[i].ID === inheritance.ID.toString()) {
                            exist = true
                        }
                    }
                    if (exist == false) {
                        __inheritances.push({
                            ID: inheritance.ID.toString(),
                            amount: inheritance.amount.toString(),
                            done: inheritance.done,
                            heir: inheritance.heir,
                            owner: inheritance.owner,
                            timeWhenWithdraw: inheritance.timeWhenWithdraw.toString(),
                            token: inheritance.token,
                            symbol
                        })
                    }
                    this.setState({inheritances: __inheritances})
                }
            })
            contract.on('Withdraw', async (ID,owner, heir,timeWhenWithdraw) => {
                let __inheritances = this.state.inheritances
                if (heir == signerAddress) {
                    __inheritances = __inheritances.filter(v => v.ID !== ID.toString())
                    this.setState({inheritances: __inheritances})
                }
            })
            contract.on('RemoveWill', async (ID, owner, heir) => {
                let __inheritances = this.state.inheritances
                if (heir == signerAddress) {
                    __inheritances = __inheritances.filter(v => v.ID !== ID.toString())
                    this.setState({inheritances: __inheritances})
                }
            })
            this.setState({ signer, signerAddress, contract, inheritances: _inheritances, network:networkName })
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

    timeConverter = this.timeConverter.bind(this)
    claim = this.claim.bind(this)

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
        <div className='your_inheritances'>
            <h3 className='your_inheritances-h3'>Your inheritances</h3>
            {
                this.state.inheritances.length > 0 
                ?
                <div className='your_inheritances_ul-btn'>
                    <ul className='your_inheritances_ul'>
                    {
                        this.state.inheritances.map((v) => {
                            return (
                                <li key={v.ID} className="your-inheritances_info">
                                    <div className='your_inheritances_ul-text'>You can harvest {ethers.utils.formatEther(v.amount)} {v.symbol} from wallet
                                    <div className='your-inheritances_color-text'>{v.owner}</div>
                                    {this.timeConverter(v.timeWhenWithdraw)} on {this.state.network} chain</div>
                                    <div className='btn_receive'><button value={v.ID.toString()} onClick={this.claim} className="btn_green">
                                    <img src="content/wallet.svg"/>
                                        Receive</button></div>
                                </li>
                            )
                        })
                    }
                </ul>
                </div>
                :
                <h4>Empty</h4>
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

export default Inheritances;