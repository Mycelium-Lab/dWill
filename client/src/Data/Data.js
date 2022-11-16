import React, { Component } from 'react';
import Wills from './Wills'
import Inheritances from './Inheritances';
import NewWill from '../Main/NewWill';
import ResetTimers from './ResetTimers';
class Data extends Component {

    render() {
        return(
            <div className='page-data'>
            {
                this.props.signer
                ?
                <div>
                    <div>
                        <ResetTimers signer={this.props.signer} signerAddress={this.props.signerAddress}/>
                    </div>
                     <div>
                        <Inheritances network={this.props.network} signer={this.props.signer} signerAddress={this.props.signerAddress}/>
                    </div>
                    <div>
                        <Wills network={this.props.network} signer={this.props.signer} signerAddress={this.props.signerAddress}/>
                    </div>
                    <div className='btn_data-js'>
                        <NewWill isEthereumNull={false} network={this.props.network} signer={this.props.signer} signerAddress={this.props.signerAddress}/>
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