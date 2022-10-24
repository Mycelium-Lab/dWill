import { ethers } from 'ethers';
import React, { Component, useState } from 'react';
import Connect from '../Utils/Connect';

import NewWill from './NewWill';

class Main extends Component {
    constructor() {
        super()
        this.state = {
            signer: null
        }
    }
    componentDidMount = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner()
            this.setState({ signer })
        } catch (error) {
            console.error(error)
        }
    }

    render() {
        return(
            <div>
                <h1>Привет!</h1>
                <h3>Will - Первый полностью децентрализованный способ
завещать свою криптовалюту.</h3>
                <p>С Will вы можете завещать любые токены со своего криптовалютного кошелька
на доверенные кошельки своих родных и близких
(или например на свой резервный кошелек)</p>
                <p>Благодаря технологии смарт-контрактов Will работает полностью децентрализованно,
надежно и автономно. Ни у кого (вообще ни у кого, даже у команды проекта)
не будет доступа к средствам, которые вы завещали. <a href='#'>Подробнее о том, как это работает.</a></p>
                <p>Чтобы создать свое первое завещание или управлять созданными подключите свой кошелек Ethereum</p>
                {
                    this.state.signer == null ? <Connect/> : <NewWill/>
                }
            </div>
        )
    }
}

export default Main