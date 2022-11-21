import React, { Component } from 'react';
import Wills from './Wills'
import Inheritances from './Inheritances';
import NewWill from '../Main/NewWill';
import ResetTimers from './ResetTimers';
class Data extends Component {

    render() {
        return (
            <div className='page-data'>
            {
                this.props.signer
                ?
                <div>
                    <div>
                        <ResetTimers 
                            contractAddress={this.props.contractAddress} 
                            signer={this.props.signer} 
                            signerAddress={this.props.signerAddress}
                        />
                    </div>
                     <div>
                        <Inheritances
                            contractAddress={this.props.contractAddress}
                            network={this.props.network} 
                            signer={this.props.signer} 
                            signerAddress={this.props.signerAddress}
                            networkProvider={this.props.networkProvider}
                        />
                    </div>
                    <div>
                        <Wills 
                            contractAddress={this.props.contractAddress} 
                            network={this.props.network} 
                            signer={this.props.signer} 
                            signerAddress={this.props.signerAddress}
                            networkProvider={this.props.networkProvider}
                            networkName={this.props.networkName}
                        />
                    </div>
                    <div className='btn_data-js'>
                        <NewWill 
                            contractAddress={this.props.contractAddress} 
                            tokenAddress={this.props.tokenAddress} 
                            isEthereumNull={false} 
                            network={this.props.network} 
                            signer={this.props.signer}
                            networkName={this.props.networkName}
                            signerAddress={this.props.signerAddress}
                            networkProvider={this.props.networkProvider}
                        />
                    </div>
                </div>
                :
                <div>
                    ...Loading
                </div>
            }
            </div>
        )
    }
}

export default Data