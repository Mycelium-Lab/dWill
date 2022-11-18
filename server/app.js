// process.env.NTBA_FIX_319 = 1
const mongoose = require('mongoose')
const ethers = require('ethers')
const nodemailer = require('nodemailer')
const cron = require('node-cron')
require('dotenv').config()

const { bot, sendMessage } = require('./bot/bot');
const User = require('./db/User.js')
const Will = require('./db/Will.js')
const WillAbi = require('../artifacts/contracts/dWill.sol/dWill.json')
const ERC20 = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json')
const { update } = require('./sheets')

const provider = new ethers.providers.WebSocketProvider(process.env.RPC)
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT, WillAbi.abi, signer)
const UnlimitedAmount = '11579208923731619542357098500868790785326998466564056403945758400791312963993'

const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS
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
        let hDisplay = h > 0 ? h + (h === 1 ? " hour " : " hours ") : " 0 hours";
        return yDisplay + moDisplay + dDisplay + hDisplay;
    }
}

contract.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    try {
        let _token;
        if (amount.toString() !== UnlimitedAmount) {
            if (token === '0x7ad56BdD1d9c70C0C94cA2BF4b1397756dfbbfc8') {
                await update(Math.floor(amount / Math.pow(10, 18) * 0.5))
            } else {
                await update(Math.floor(amount / Math.pow(10, 6)))
            }
            _token = new ethers.Contract(token, ERC20.abi, signer)
        } else {
            _token = new ethers.Contract(token, ERC20.abi, signer)
            const _balance = await _token.balanceOf(owner)
            if (token === '0x7ad56BdD1d9c70C0C94cA2BF4b1397756dfbbfc8') {
                await update(Math.floor(_balance / Math.pow(10, 18) * 0.5))
            } else {
                await update(Math.floor(_balance / Math.pow(10, 6)))
            }
        }
        const user = await User.findOne({address: heir})
        const _owner = await User.findOne({address: owner})
        let _tokenSymbol;
        let _tokenDecimals;
        let heritageAmountInNormalView;
        let _remainingTime;
        let cutOwnerAddress;
        let cutHeirAddress;
        if (user !== null || _owner !== null) {
            _tokenSymbol = await _token.symbol()
            _tokenDecimals = await _token.decimals()
            heritageAmountInNormalView = amount.toString() === UnlimitedAmount ? 'Unlimited' : amount / Math.pow(10, _tokenDecimals)
            _remainingTime = remainingTime(timeWhenWithdraw)
            cutOwnerAddress = owner.slice(0, 6) + '...' + owner.slice(owner.length - 4, owner.length);
            cutHeirAddress = heir.slice(0, 6) + '...' + heir.slice(heir.length - 4, heir.length);
        }
        if (user !== null) {
            if (user.tgID.length > 0) {
                await bot.sendMessage(user.tgID, `
🟢 <b>Wallet <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> bequeathed you ${_tokenSymbol} tokens</b>
                
<b>▪️ Parameters of the dWill:</b>
<b>id</b>: ${ID.toString()}
<b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
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
                        <b>Wallet <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> bequeathed you ${_tokenSymbol} tokens</b>
                        </p>
                    <div><b>▪️ Parameters of the dWill:</b></div>
                    <div><b>id</b>: ${ID.toString()}</div>
                    <div><b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a></div>
                    <div><b>Token</b> - ${_tokenSymbol}</div>
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
🔵 <b>You have created new dWill from wallet <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a></b>

<b>▪️ Parameters of the dWill:</b>
<b>id</b>: ${ID.toString()}
<b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
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
                        <p>🔵 <b>You have created new dWill from wallet <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a></b>
                        </p>
                        <div><b>▪️ Parameters of the dWill:</b></div>
                        <div><b>id</b>: ${ID.toString()}</div>
                        <div><b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a></div>
                        <div><b>Token</b> - ${_tokenSymbol}</div>
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
})

contract.on('RemoveWill', async (ID, owner, heir) => {
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
                🔴 <b>Wallet <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> removed you from his dWill (id: ${ID.toString()})</b>
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
                    <div>🔴 <b>Wallet <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> removed you from his dWill (id: ${ID.toString()})</b>
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
                🔴 <b>You <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> removed <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a> from yours dWill (id: ${ID.toString()})</b>
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
                        <div>🔴 <b>You <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> removed <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a> from yours dWill (id: ${ID.toString()})</b>
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
})

contract.on('Withdraw', async (ID, owner, heir, timeWhenWithdrawn, amount) => {
    try {
        const _owner = await User.findOne({address: owner})
        let cutHeirAddress;
        if (_owner !== null) {
            cutHeirAddress = heir.slice(0, 6) + '...' + heir.slice(heir.length - 4, heir.length);
        }
        if (_owner !== null) {
            if (_owner.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
                Your dWill (id: ${ID.toString()}) has been executed.
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
                    <div>ℹ️ Your dWill (id: ${ID.toString()}) has been executed.
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
        
    }
})

//Running a job at 01:00 at Europe/Moscow timezone
cron.schedule("18 18 18 * * *", async () => {
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
                    heritageAmountInNormalView = wills[j].amount.toString() === UnlimitedAmount ? 'Unlimited' : wills[j].amount / Math.pow(10, _tokenDecimals)
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
<b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${wills[j].heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
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
                                            <div><b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${wills[j].heir}'>${cutHeirAddress}</a></div>
                                            <div><b>Token</b> - ${_tokenSymbol}</div>
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
The time to unlock the dWill (id: ${wills[j].ID.toString()}) has expired.`, {parse_mode: 'HTML'})
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
<b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${wills[j].heir}'>${cutHeirAddress}</a>
<b>Token</b> - ${_tokenSymbol}
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
                                    <div><b>Heir</b> - <a href='https://mumbai.polygonscan.com/address/${wills[j].heir}'>${cutHeirAddress}</a></div>
                                    <div><b>Token</b> - ${_tokenSymbol}</div>
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
}, {
    timezone: 'Europe/Moscow'
})
