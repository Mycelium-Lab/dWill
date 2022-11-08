import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Wills from './Wills'
import Inheritances from './Inheritances';
import NewWill from '../Main/NewWill';
import ResetTimers from './ResetTimers';
class Data extends Component {
    render() {
        return(
            <div className='page-data'>
                <div>
                    <ResetTimers/>
                </div>
                <div>
                    <Inheritances/>
                </div>
                <div>
                    <Wills/>
                </div>
                <div className='btn_data-js'>
                    <NewWill isEthereumNull={false}/>
                </div>
            </div>
        )
    }
}

export default Data