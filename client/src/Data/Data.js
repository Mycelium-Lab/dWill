import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Wills from './Wills'
import Inheritances from './Inheritances';
import NewWill from '../Main/NewWill';
import ResetTimers from './ResetTimers';

class Data extends Component {
    render() {
        return(
            <div>
                <div>
                    <NewWill/>
                </div>
                <div>
                    <ResetTimers/>
                </div>
                <div>
                    <Inheritances/>
                </div>
                <div>
                    <Wills/>
                </div>
            </div>
        )
    }
}

export default Data