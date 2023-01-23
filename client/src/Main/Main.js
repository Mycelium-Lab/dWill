import { ethers } from 'ethers';
import React, { Component } from 'react';
import Connect from '../Utils/Connect';

import Inheritances from '../Data/Inheritances';
import NewWill from './NewWill';

class Main extends Component {
    constructor(props) {
        super(props)
        this.state = {
            signer: null
        }
    }

    async disconnect(account) {
        if (account !== null) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner()
            this.setState({ signer })
        } else {
            this.setState({ signer: null })
        }
    }

    disconnect = this.disconnect.bind(this)

    render() {
        return (
            <div className='main-text'>
                {/* <h1 className="block-one__title">Hello!</h1> */}
                <h3 className="block-one">dWill - the first fully decentralized way to bequeath your cryptocurrency.</h3>
                <p className="block-two">dWill - the first decentralized non-custodial inheritance protocol. With dWill, you can bequeath tokens from your cryptocurrency wallet to the trusted wallets of your family and friends (or, for example, to your reserve wallet)</p>
                <p className="block-two">Thanks to smart contract technology, dWill works completely in a decentralized way, reliably and autonomously. No one (no one at all, not even the project team) will have access to the funds you bequeathed.&nbsp;<a href='https://dwill.slite.page/p/yFyU0Vhz-TJakC/dWIll' target="_blank" rel="noreferrer">Read more about how it works.</a>
                </p>
                {
                    (this.props.inheritancesLength === 0 || this.props.signer === null)
                        ?
                        ''
                        : <Inheritances
                            contractAddress={this.props.contractAddress}
                            network={this.props.network}
                            signer={this.props.signer}
                            signerAddress={this.props.signerAddress}
                            networkProvider={this.props.networkProvider}
                            networkName={this.props.networkName}
                            networkPic={this.props.networkPic}
                        />
                }
                <p className="block-three">
                    {
                        (this.props.willsLength === 0) && (this.props.signer !== null)
                            ?
                            `You don't have active dWills on the ${this.props.networkName} network yet.`
                            :
                            'To create your first dWill or manage created, please connect your Ethereum wallet'
                    }
                </p>
                {/* {
                    this.props.signerAddress 
                    ? 
                    <NewWill isEthereumNull={false} network={this.props.network} signer={this.props.signer} signerAddress={this.props.signerAddress}/>
                    :
                    null
                } */}
                {
                    this.props.signer === null
                        ?
                        <Connect setProperties={this.props.setProperties} network={this.props.network} />
                        :
                        <NewWill
                            contractAddress={this.props.contractAddress}
                            tokenAddress={this.props.tokenAddress}
                            isEthereumNull={false}
                            network={this.props.network}
                            signer={this.props.signer}
                            signerAddress={this.props.signerAddress}
                            networkProvider={this.props.networkProvider}
                            networkName={this.props.networkName}
                            networkPic={this.props.networkPic}
                        />
                }
            </div>
        )
    }
}



export default Main
