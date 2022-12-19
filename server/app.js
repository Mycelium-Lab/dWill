// process.env.NTBA_FIX_319 = 1
import mongoose from 'mongoose'
import ethers from 'ethers'
import nodemailer from 'nodemailer'
import cron from 'node-cron'
import dotenv from 'dotenv'
dotenv.config()
import { bot, sendMessage } from './bot/bot.js';
import User from './db/User.js'
import WillMumbai from './db/WillMumbai.js'
import WillGoerli from './db/WillGoerli.js'
import WillBinanceTest from './db/WillBinanceTest.js'
import WillAbi from '../artifacts/contracts/dWill.sol/dWill.json' assert { type: "json" }
import ERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json' assert { type: "json" }
import { contractAddresses, NetworkExplorers } from './utils/constants.js'
import { addAmountToPool } from './service/addAmountToPool.js'
import WillArbitrum from './db/WillArbitrum.js'
import WillPolygon from './db/WillPolygon.js'
import WillEthereum from './db/WillEthereum.js'
import WillBNB from './db/WillBNB.js'
import WillOptimism from './db/WillOptimism.js'
import WillAvalanche from './db/WillAvalanche.js'

// const providerMumbai = new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC)
// const providerGoerli = new ethers.providers.JsonRpcProvider(process.env.GOERLI_RPC)
// const providerBinanceTestnet = new ethers.providers.JsonRpcProvider(process.env.BINANCETEST_RPC)
// const signerMumbai = new ethers.Wallet(process.env.PRIVATE_KEY, providerMumbai);
// const signerGoerli = new ethers.Wallet(process.env.PRIVATE_KEY, providerGoerli);
// const signerBinanceTestnet = new ethers.Wallet(process.env.PRIVATE_KEY, providerBinanceTestnet);
// const contractMumbai = new ethers.Contract(contractAddresses.Mumbai, WillAbi.abi, signerMumbai)
// const contractGoerli = new ethers.Contract(contractAddresses.Goerli, WillAbi.abi, signerGoerli)
// const contractBinanceTestnet = new ethers.Contract(contractAddresses.BinanceTestnet, WillAbi.abi, signerBinanceTestnet)

const providerPolygon = new ethers.providers.JsonRpcProvider(process.env.POLYGONRPC)
const signerPolygon = new ethers.Wallet(process.env.PRIVATE_KEY, providerPolygon);
const contractPolygon = new ethers.Contract(contractAddresses.Polygon, WillAbi.abi, signerPolygon)

const providerEthereum = new ethers.providers.JsonRpcProvider(process.env.ETHEREUMRPC)
const signerEthereum = new ethers.Wallet(process.env.PRIVATE_KEY, providerEthereum);
const contractEthereum = new ethers.Contract(contractAddresses.EthereumMainnet, WillAbi.abi, signerEthereum)

const providerBinanceMainnet = new ethers.providers.JsonRpcProvider(process.env.BINANCEMAINRPC)
const signerBinanceMainnet = new ethers.Wallet(process.env.PRIVATE_KEY, providerBinanceMainnet);
const contractBinanceMainnet = new ethers.Contract(contractAddresses.BinanceMainnet, WillAbi.abi, signerBinanceMainnet)

const providerArbitrum = new ethers.providers.JsonRpcProvider(process.env.ARBITRUMRPC)
const signerArbitrum = new ethers.Wallet(process.env.PRIVATE_KEY, providerArbitrum);
const contractArbitrum = new ethers.Contract(contractAddresses.ArbitrumMainnet, WillAbi.abi, signerArbitrum)

const providerOptimism = new ethers.providers.JsonRpcProvider(process.env.OPTIMISMRPC)
const signerOptimism = new ethers.Wallet(process.env.PRIVATE_KEY, providerOptimism);
const contractOptimism = new ethers.Contract(contractAddresses.OptimismMainnet, WillAbi.abi, signerOptimism)

const providerAvalanche = new ethers.providers.JsonRpcProvider(process.env.AVALANCHERPC)
const signerAvalanche = new ethers.Wallet(process.env.PRIVATE_KEY, providerAvalanche);
const contractAvalanche = new ethers.Contract(contractAddresses.AvalancheMainnet, WillAbi.abi, signerAvalanche)


const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    tls: {
      rejectUnauthorized: false
    }
})

mongoose.connect(process.env.MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then( () => console.log("Connected to MongoDB."))
.catch( err => console.log(err));


function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var time = `${date < 10 ? '0'+ date : date}` + '.' + `${month < 10 ? '0' + month : month}` + '.' + year;
    return time;
}

function remainingTime(timeWhenWithdraw) {
    const _timeNow = new Date()
    const _timeWhenWithdraw = new Date(parseInt(timeWhenWithdraw) * 1000)
    if (_timeWhenWithdraw < _timeNow) {
        return 'Nothing.'
    } else {
        const seconds = Math.floor((new Date(_timeWhenWithdraw - _timeNow)).getTime() / 1000)
        let y = Math.floor(seconds / 31536000);
        let mo = Math.floor((seconds % 31536000) / 2628000);
        let d = Math.floor(((seconds % 31536000) % 2628000) / 86400);
        let h = Math.floor((seconds % (3600 * 24)) / 3600);
      
        let yDisplay = y > 0 ? y + (y === 1 ? " year, " : " years, ") : " 0 years,";
        let moDisplay = mo > 0 ? mo + (mo === 1 ? " month, " : " months, ") : " 0 months,";
        let dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : " 0 days, ";
        let hDisplay = h > 0 ? h + (h === 1 ? " hour " : " hours ") : " 0 hours ";
        return yDisplay + moDisplay + dDisplay + hDisplay;
    }
}

// contractMumbai.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
//     await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'Mumbai Chain', NetworkExplorers.Mumbai, signerMumbai)
// })

// contractGoerli.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
//     await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'Goerli Chain', NetworkExplorers.Goerli, signerGoerli)
// })

// contractBinanceTestnet.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
//     await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'BinanceTest Chain', NetworkExplorers.BinanceTestnet, signerBinanceTestnet)
// })

// contractMumbai.on('RemoveWill', async (ID, owner, heir) => {
//     await removeWill(ID, owner, heir, 'Mumbai Chain', NetworkExplorers.Mumbai)
// })

// contractGoerli.on('RemoveWill', async (ID, owner, heir) => {
//     await removeWill(ID, owner, heir, 'Goerli Chain', NetworkExplorers.Goerli)
// })

// contractBinanceTestnet.on('RemoveWill', async (ID, owner, heir) => {
//     await removeWill(ID, owner, heir, 'BinanceTest Chain', NetworkExplorers.BinanceTestnet)
// })

// contractMumbai.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
//     await withdraw(ID, owner, 'Mumbai Chain')
// })

// contractGoerli.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
//     await withdraw(ID, owner, 'Goerli Chain')
// })

// contractBinanceTestnet.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
//     await withdraw(ID, owner, 'BinanceTest Chain')
// })

contractPolygon.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'Polygon Chain', NetworkExplorers.Polygon, signerPolygon)
})
contractPolygon.on('RemoveWill', async (ID, owner, heir) => {
    await removeWill(ID, owner, heir, 'Polygon Chain', NetworkExplorers.Polygon)
})
contractPolygon.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
    await withdraw(ID, owner, 'Polygon Chain')
})

contractEthereum.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'Ethereum Chain', NetworkExplorers.EthereumMainnet, signerEthereum)
})
contractEthereum.on('RemoveWill', async (ID, owner, heir) => {
    await removeWill(ID, owner, heir, 'Ethereum Chain', NetworkExplorers.EthereumMainnet)
})
contractEthereum.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
    await withdraw(ID, owner, 'Ethereum Chain')
})

contractBinanceMainnet.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'BNB Chain', NetworkExplorers.BinanceMainnet, signerBinanceMainnet)
})
contractBinanceMainnet.on('RemoveWill', async (ID, owner, heir) => {
    await removeWill(ID, owner, heir, 'BNB Chain', NetworkExplorers.BinanceMainnet)
})
contractBinanceMainnet.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
    await withdraw(ID, owner, 'BNB Chain')
})

contractArbitrum.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'Arbitrum Chain', NetworkExplorers.ArbitrumMainnet, signerArbitrum)
})
contractArbitrum.on('RemoveWill', async (ID, owner, heir) => {
    await removeWill(ID, owner, heir, 'Arbitrum Chain', NetworkExplorers.ArbitrumMainnet)
})
contractArbitrum.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
    await withdraw(ID, owner, 'Arbitrum Chain')
})

contractOptimism.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'Optimism Chain', NetworkExplorers.OptimismMainnet, signerOptimism)
})
contractOptimism.on('RemoveWill', async (ID, owner, heir) => {
    await removeWill(ID, owner, heir, 'Optimism Chain', NetworkExplorers.OptimismMainnet)
})
contractOptimism.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
    await withdraw(ID, owner, 'Optimism Chain')
})

contractAvalanche.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    await addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, 'Avalanche Chain', NetworkExplorers.AvalancheMainnet, signerAvalanche)
})
contractAvalanche.on('RemoveWill', async (ID, owner, heir) => {
    await removeWill(ID, owner, heir, 'Avalanche Chain', NetworkExplorers.AvalancheMainnet)
})
contractAvalanche.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
    await withdraw(ID, owner, 'Avalanche Chain')
})

async function addAnHeir(ID,owner,heir,token,timeWhenWithdraw,amount, network, explorer, signer) {
    try {
        let _token = new ethers.Contract(token, ERC20.abi, signer);
        const _tokenSymbol = await _token.symbol()
        const _tokenDecimals = await _token.decimals()
        const _balance = await _token.balanceOf(owner)
        await addAmountToPool(_tokenSymbol, amount,_balance,_tokenDecimals)
        const user = await User.findOne({address: heir})
        const _owner = await User.findOne({address: owner})
        let heritageAmountInNormalView;
        let _remainingTime;
        let cutOwnerAddress;
        let cutHeirAddress;
        if (user !== null || _owner !== null) {
            heritageAmountInNormalView = amount.toString() === ethers.constants.MaxUint256.toString() ? 'Unlimited' : amount / Math.pow(10, _tokenDecimals)
            _remainingTime = remainingTime(timeWhenWithdraw)
            cutOwnerAddress = owner.slice(0, 6) + '...' + owner.slice(owner.length - 4, owner.length);
            cutHeirAddress = heir.slice(0, 6) + '...' + heir.slice(heir.length - 4, heir.length);
        }
        if (user !== null) {
            if (user.tgID.length > 0) {
                await bot.sendMessage(user.tgID, `
🟢 <b>Wallet <a href='${explorer}${owner}'>${cutOwnerAddress}</a> bequeathed you ${_tokenSymbol} tokens</b>
                
<b>▪️ Parameters of the dWill:</b>
<b>id</b>: ${ID.toString()}
<b>Heir</b> - <a href='${explorer}${heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
<b>Network</b> - ${network}
<b>Limit on the amount</b> - ${heritageAmountInNormalView}
<b>Time to unlock the dWill</b> - ${_remainingTime}
                `, {parse_mode: 'HTML'})
            }
            if (user.email !== null) {
                transporter.sendMail({
                    from: process.env.EMAILUSER,
                    to: user.email,
                    subject: 'dWill notification. New dWill.',
                    html: `
                    <p>Hello!</p>
                    <p>You got this message because you signed up for updates in the
                        <a href="https://t.me/thewill_bot">telegram bot</a> of the
                        <a href="http://dwill.app">dwill.app</a> project
                    </p>
                    <br/>
                    <p>🟢 
                        <b>Wallet <a href='${explorer}${owner}'>${cutOwnerAddress}</a> bequeathed you ${_tokenSymbol} tokens</b>
                        </p>
                    <div><b>▪️ Parameters of the dWill:</b></div>
                    <div><b>id</b>: ${ID.toString()}</div>
                    <div><b>Heir</b> - <a href='${explorer}${heir}'>${cutHeirAddress}</a></div>
                    <div><b>Token</b> - ${_tokenSymbol}</div>
                    <div><b>Network</b> - ${network}</div>
                    <div><b>Limit on the amount</b> - ${heritageAmountInNormalView}</div>
                    <div><b>Time to unlock the dWill</b> - ${_remainingTime}</div>
                    <br/>
                    <br/>
                    <p>Note: This is an automatic message. Please do not reply.</p>
                    <p>If you have any questions, please contact project support on
                        <a href="https://t.me/PerminovMA">Telegram</a>
                    </p>
                                    `
                }, (err) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log('Email sended')
                    }
                })
            }
        }
        if (_owner !== null) {
            if (_owner.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
🔵 <b>You have created new dWill from wallet <a href='${explorer}${owner}'>${cutOwnerAddress}</a></b>

<b>▪️ Parameters of the dWill:</b>
<b>id</b>: ${ID.toString()}
<b>Heir</b> - <a href='${explorer}${heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
<b>Network</b> - ${network}
<b>Limit on the amount</b> - ${heritageAmountInNormalView}
<b>Time to unlock the dWill</b> - ${_remainingTime}
`, {parse_mode: 'HTML'})
            }
            if (_owner.email !== null) {
                setTimeout(() => {
                    transporter.sendMail({
                        from: process.env.EMAILUSER,
                        to: _owner.email,
                        subject: 'dWill notification. New dWill.',
                        html: `
                        <p>Hello!</p>
                        <p>You got this message because you signed up for updates in the
                            <a href="https://t.me/thewill_bot">telegram bot</a> of the
                            <a href="http://dwill.app">dwill.app</a> project
                        </p>
                        <br/>
                        <p>🔵 <b>You have created new dWill from wallet <a href='${explorer}${owner}'>${cutOwnerAddress}</a></b>
                        </p>
                        <div><b>▪️ Parameters of the dWill:</b></div>
                        <div><b>id</b>: ${ID.toString()}</div>
                        <div><b>Heir</b> - <a href='${explorer}${heir}'>${cutHeirAddress}</a></div>
                        <div><b>Token</b> - ${_tokenSymbol}</div>
                        <div><b>Network</b> - ${network}</div>
                        <div><b>Limit on the amount</b> - ${heritageAmountInNormalView}</div>
                        <div><b>Time to unlock the dWill</b> - ${_remainingTime}</div>
                        <br/>
                        <br/>
                        <p>Note: This is an automatic message. Please do not reply.</p>
                        <p>If you have any questions, please contact project support on
                            <a href="https://t.me/PerminovMA">Telegram</a>
                        </p>
                        `
                    }, (err) => {
                        if (err) {
                            console.error(err)
                        } else {
                            console.log('Email sended')
                        }
                    })
                }, 5000)
            }
        }
    } catch (error) {
        console.error(error)
    }
}


async function removeWill(ID, owner, heir, network, explorer) {
    try {
        const user = await User.findOne({address: heir})
        const _owner = await User.findOne({address: owner})
        let cutOwnerAddress;
        let cutHeirAddress;
        if (user !== null || _owner !== null) {
            cutOwnerAddress = owner.slice(0, 6) + '...' + owner.slice(owner.length - 4, owner.length);
            cutHeirAddress = heir.slice(0, 6) + '...' + heir.slice(heir.length - 4, heir.length);
        }
        if (user !== null) {
            if (user.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
                🔴 <b>Wallet <a href='${explorer}${owner}'>${cutOwnerAddress}</a> removed you from his dWill (id: ${ID.toString()}) on ${network}</b>
                `, {parse_mode: 'HTML'})
            }
            if (user.email !== null) {
                transporter.sendMail({
                    from: process.env.EMAILUSER,
                    to: user.email,
                    subject: 'dWill notification. dWill removed.',
                    html: `
                    <p>Hello!</p>
                    <p>You got this message because you signed up for updates in the
                        <a href="https://t.me/thewill_bot">telegram bot</a> of the
                        <a href="http://dwill.app">dwill.app</a> project
                    </p>
                    <br/>
                    <div>🔴 <b>Wallet <a href='${explorer}${owner}'>${cutOwnerAddress}</a> removed you from his dWill (id: ${ID.toString()}) on ${network}</b>
                    </div>
                    <br/>
                    <br/>
                    <p>Note: This is an automatic message. Please do not reply.</p>
                    <p>If you have any questions, please contact project support on
                        <a href="https://t.me/PerminovMA">Telegram</a>
                    </p>
                    `
                }, (err) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log('Email sended')
                    }
                })
            }
        }
        if (_owner !== null) {
            if (_owner.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
                🔴 <b>You <a href='${explorer}${owner}'>${cutOwnerAddress}</a> removed <a href='${explorer}${heir}'>${cutHeirAddress}</a> from yours dWill (id: ${ID.toString()}) on ${network}</b>
                `, {parse_mode: 'HTML'})
            }
            if (_owner.email !== null) {
                setTimeout(() => {
                    transporter.sendMail({
                        from: process.env.EMAILUSER,
                        to: _owner.email,
                        subject: 'dWill notification. dWill removed.',
                        html: `
                        <p>Hello!</p>
                        <p>You got this message because you signed up for updates in the
                            <a href="https://t.me/thewill_bot">telegram bot</a> of the
                            <a href="http://dwill.app">dwill.app</a> project
                        </p>
                        <br/>
                        <div>🔴 <b>You <a href='${explorer}${owner}'>${cutOwnerAddress}</a> removed <a href='${explorer}${heir}'>${cutHeirAddress}</a> from yours dWill (id: ${ID.toString()}) on ${network}</b>
                        </div>
                        <br/>
                        <br/>
                        <p>Note: This is an automatic message. Please do not reply.</p>
                        <p>If you have any questions, please contact project support on
                            <a href="https://t.me/PerminovMA">Telegram</a>
                        </p>
                        `
                    }, (err) => {
                        if (err) {
                            console.error(err)
                        } else {
                            console.log('Email sended')
                        }
                    })
                }, 5000)
            }
        }
    } catch (error) {
        console.error(error)
    }
}

async function withdraw(ID, owner, network) {
    try {
        const _owner = await User.findOne({address: owner})
        if (_owner !== null) {
            if (_owner.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
                ℹ️ Your dWill (id: ${ID.toString()}) on ${network} has been executed.
                `, {parse_mode: 'HTML'})
            }
            if (_owner.email !== null) {
                transporter.sendMail({
                    from: process.env.EMAILUSER,
                    to: _owner.email,
                    subject: 'dWill notification. dWill withdraw.',
                    html: `
                    <p>Hello!</p>
                    <p>You got this message because you signed up for updates in the
                        <a href="https://t.me/thewill_bot">telegram bot</a> of the
                        <a href="http://dwill.app">dwill.app</a> project
                    </p>
                    <br/>
                    <div>ℹ️ Your dWill (id: ${ID.toString()}) on ${network} has been executed.
                    </div>
                    <br/>
                    <br/>
                    <p>Note: This is an automatic message. Please do not reply.</p>
                    <p>If you have any questions, please contact project support on
                        <a href="https://t.me/PerminovMA">Telegram</a>
                    </p>
                    `
                }, (err) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log('Email sended')
                    }
                })
            }
        }
    } catch (error) {
        console.error(error)
    }
}

// //Running a job at Europe/Moscow timezone
// cron.schedule("10 10 10 * * *", async () => {
//     await remainTimeCron(contractMumbai, 'Mumbai Chain', NetworkExplorers.Mumbai, WillMumbai, signerMumbai)
// }, {
//     timezone: 'Europe/Moscow'
// })

// cron.schedule("13 13 13 * * *", async () => {
//     await remainTimeCron(contractGoerli, 'Goerli Chain', NetworkExplorers.Goerli, WillGoerli, signerGoerli)
// }, {
//     timezone: 'Europe/Moscow'
// })

// cron.schedule("16 16 16 * * *", async () => {
//     await remainTimeCron(contractBinanceTestnet, 'BinanceTest Chain', NetworkExplorers.BinanceTestnet, WillBinanceTest, signerBinanceTestnet)
// }, {
//     timezone: 'Europe/Moscow'
// })

cron.schedule("6 6 6 * * *", async () => {
    await remainTimeCron(contractPolygon, 'Polygon Chain', NetworkExplorers.Polygon, WillPolygon, signerPolygon)
}, {
    timezone: 'Europe/Moscow'
})

cron.schedule("8 8 8 * * *", async () => {
    await remainTimeCron(contractEthereum, 'Ethereum Chain', NetworkExplorers.EthereumMainnet, WillEthereum, signerEthereum)
}, {
    timezone: 'Europe/Moscow'
})

cron.schedule("10 10 10 * * *", async () => {
    await remainTimeCron(contractBinanceMainnet, 'BNB Chain', NetworkExplorers.BinanceMainnet, WillBNB, signerBinanceMainnet)
}, {
    timezone: 'Europe/Moscow'
})

cron.schedule("12 12 12 * * *", async () => {
    await remainTimeCron(contractArbitrum, 'Arbitrum Chain', NetworkExplorers.ArbitrumMainnet, WillArbitrum, signerArbitrum)
}, {
    timezone: 'Europe/Moscow'
})

cron.schedule("14 14 14 * * *", async () => {
    await remainTimeCron(contractOptimism, 'Optimism Chain', NetworkExplorers.OptimismMainnet, WillOptimism, signerOptimism)
}, {
    timezone: 'Europe/Moscow'
})

cron.schedule("16 16 16 * * *", async () => {
    await remainTimeCron(contractAvalanche, 'Avalanche Chain', NetworkExplorers.AvalancheMainnet, WillAvalanche, signerAvalanche)
}, {
    timezone: 'Europe/Moscow'
})

async function remainTimeCron(contract, network, explorer, Will, signer) {
    try {
        const users = await User.find()
        for (let i = 0; i < users.length; i++) {
            const wills = await contract.getAllWills(users[i].address)
            for (let j = 0; j < wills.length; j++) {
                const remaining = remainingTime(wills[j].timeWhenWithdraw)
                if (
                    (remaining.includes('0 years') && remaining.includes('11 months') && remaining.includes('28 days'))
                    ||
                    (remaining.includes('0 years') && remaining.includes('5 months') && remaining.includes('28 days'))
                    ||
                    (remaining.includes('0 years') && remaining.includes('2 months') && remaining.includes('28 days'))
                    ||
                    (remaining.includes('0 years') && remaining.includes('0 months') && remaining.includes('28 days'))
                    ||
                    (remaining.includes('0 years') && remaining.includes('0 months') && remaining.includes('6 days'))
                    ||
                    (remaining.includes('0 years') && remaining.includes('0 months') && remaining.includes('0 days'))
                    ||
                    (remaining.includes('Nothing'))
                ) {
                    const _token = new ethers.Contract(wills[j].token, ERC20.abi, signer)
                    const _tokenSymbol = await _token.symbol()
                    const _tokenDecimals = await _token.decimals()
                    const heritageAmountInNormalView = wills[j].amount.toString() === ethers.constants.MaxUint256.toString() ? 'Unlimited' : wills[j].amount / Math.pow(10, _tokenDecimals)
                    const cutHeirAddress = wills[j].heir.slice(0, 6) + '...' + wills[j].heir.slice(wills[j].heir.length - 4, wills[j].heir.length);
                    if (users[i].tgID.length > 0) {
                        if (remaining.includes('Nothing')) {
                            const alreadyExistInDB = await Will.findOne({ID: wills[j].ID})
                            if (alreadyExistInDB === null) {
                                const __heir = await User.findOne({address: wills[j].heir})
                                if (__heir !== null) {
                                    await bot.sendMessage(__heir.tgID, `
<b>ℹ️ dWill notification:</b>

The time to unlock the dWill (id: ${wills[j].ID.toString()}) has expired
You can withdraw your tokens on our site <a href='https://dwill.app/'>dWill.app</a>.

<b>▪️ Parameters of the dWill:</b>
<b>Heir</b> - <a href='${explorer}${wills[j].heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
<b>Network</b> - ${network}
<b>Limit on the amount</b> - ${heritageAmountInNormalView}
                                    `, {parse_mode: 'HTML'})
                                    if (__heir.email !== null) {
                                        transporter.sendMail({
                                            from: process.env.EMAILUSER,
                                            to: __heir.email,
                                            subject: 'dWill notification. dWill time expired.',
                                            html: `
                                            <p>Hello!</p>
                                            <p>You got this message because you signed up for updates in the
                                                <a href="https://t.me/thewill_bot">telegram bot</a> of the
                                                <a href="http://dwill.app">dwill.app</a> project
                                            </p>
                                            <br/>
                                            <p><b>ℹ️ dWill notification:</b></p>
                                            
                                            <div>The time to unlock the dWill (id: ${wills[j].ID.toString()}) has expired</div>
                                            <div>You can withdraw your tokens on our site <a href='https://dwill.app/'>dWill.app</a>.</div>
                                            
                                            <div><b>▪️ Parameters of the dWill:</b></div>
                                            <div><b>Heir</b> - <a href='${explorer}${wills[j].heir}'>${cutHeirAddress}</a></div>
                                            <div><b>Token</b> - ${_tokenSymbol}</div>
                                            <div><b>Network</b> - ${network}</div>
                                            <div><b>Limit on the amount</b> - ${heritageAmountInNormalView}</div>
                                            <br/>
                                            <br/>
                                            <p>Note: This is an automatic message. Please do not reply.</p>
                                            <p>If you have any questions, please contact project support on
                                                <a href="https://t.me/PerminovMA">Telegram</a>
                                            </p>
                                                                                `
                                        }, (err) => {
                                            if (err) {
                                                console.error(err)
                                            } else {
                                                console.log('Email sended')
                                            }
                                        })
                                    }
                                }
                                await bot.sendMessage(users[i].tgID, `
ℹ️ dWill notification:
The time to unlock the dWill (id: ${wills[j].ID.toString()}) on ${network} has expired.`, {parse_mode: 'HTML'})
                                if (users[i].email !== null) {
                                    transporter.sendMail({
                                        from: process.env.EMAILUSER,
                                        to: users[i].email,
                                        subject: 'dWill notification. dWill time expired.',
                                        html: `
                                        <p>Hello!</p>
                                        <p>You got this message because you signed up for updates in the
                                            <a href="https://t.me/thewill_bot">telegram bot</a> of the
                                            <a href="http://dwill.app">dwill.app</a> project
                                        </p>
                                        <br/>
                                        <p>ℹ️ dWill notification:</p>
                                        
                                        <div>The time to unlock the dWill (id: ${wills[j].ID.toString()}) has expired.</div>
                                        <br/>
                                        <br/>
                                        <p>Note: This is an automatic message. Please do not reply.</p>
                                        <p>If you have any questions, please contact project support on
                                            <a href="https://t.me/PerminovMA">Telegram</a>
                                        </p>`
                                    }, (err) => {
                                        if (err) {
                                            console.error(err)
                                        } else {
                                            console.log('Email sended')
                                        }
                                    })
                                }
                                const addToDB = new Will({ID: wills[j].ID, isLastMessageSended: true})
                                await addToDB.save()
                            }
                        } else {
                            await bot.sendMessage(users[i].tgID, `
<b>ℹ️ dWill notification:</b>

Time to unlock the dWill - ${remaining}

<b>▪️ Parameters of the dWill:</b>
<b>id</b>: ${wills[j].ID.toString()}
<b>Heir</b> - <a href='${explorer}${wills[j].heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
<b>Network</b> - ${network}
<b>Limit on the amount</b> - ${heritageAmountInNormalView}
<b>Time to unlock the dWill</b> - ${remaining}
`, {parse_mode: 'HTML'})
                            if (users[i].email !== null) {
                                transporter.sendMail({
                                    from: process.env.EMAILUSER,
                                    to: users[i].email,
                                    subject: 'dWill notification. dWill time reminder.',
                                    html: `
                                    <p>Hello!</p>
                                    <p>You got this message because you signed up for updates in the
                                        <a href="https://t.me/thewill_bot">telegram bot</a> of the
                                        <a href="http://dwill.app">dwill.app</a> project
                                    </p>
                                    <br/>
                                    <p><b>ℹ️ dWill notification:</b></p>
                                    
                                    <p>Time to unlock the dWill - ${remaining}</p>
                                    
                                    <div><b>▪️ Parameters of the dWill:</b></div>
                                    <div><b>id</b>: ${wills[j].ID.toString()}</div>
                                    <div><b>Heir</b> - <a href='${explorer}${wills[j].heir}'>${cutHeirAddress}</a></div>
                                    <div><b>Token</b> - ${_tokenSymbol}</div>
                                    <div><b>Network</b> - ${network}</div>
                                    <div><b>Limit on the amount</b> - ${heritageAmountInNormalView}</div>
                                    <div><b>Time to unlock the dWill</b> - ${remaining}</div>
                                    <br/>
                                    <br/>
                                    <p>Note: This is an automatic message. Please do not reply.</p>
                                    <p>If you have any questions, please contact project support on
                                        <a href="https://t.me/PerminovMA">Telegram</a>
                                    </p>
                                    `
                                }, (err) => {
                                    if (err) {
                                        console.error(err)
                                    } else {
                                        console.log('Email sended')
                                    }
                                })
                            }
                        }
                    }
                }

            }
        }
    } catch (error) {
        console.error(error)
    }
}
