import React, { Component, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Wills from './Wills'
import Inheritances from './Inheritances';

class Data extends Component {
    render() {
        return(
            <div>
                <Button>
                    Reset timers
                </Button>
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