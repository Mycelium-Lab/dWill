// process.env.NTBA_FIX_319 = 1
const mongoose = require('mongoose')
const ethers = require('ethers')
const nodemailer = require('nodemailer')
require('dotenv').config()

const { bot, sendMessage } = require('./bot/bot');
const User = require('./db/User.js')
const Will = require('./db/Will.js')
const WillAbi = require('../artifacts/contracts/TheWill.sol/TheWill.json')
const ERC20 = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json')

const provider = new ethers.providers.WebSocketProvider(process.env.RPC)
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT, WillAbi.abi, signer)

// const transporter = nodemailer.createTransport({
//     service: 'hotmail',
//     auth: {
//         user: process.env.EMAILUSER,
//         pass: process.env.EMAILPASS
//     }
// })

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
        const user = await User.findOne({address: heir})
        const _owner = await User.findOne({address: owner})
        let _tokenSymbol;
        let _tokenDecimals;
        let heritageAmountInNormalView;
        let _remainingTime;
        let cutOwnerAddress;
        let cutHeirAddress;
        if (user !== null || _owner !== null) {
            const _token = new ethers.Contract(token, ERC20.abi, signer)
            _tokenSymbol = await _token.symbol()
            _tokenDecimals = await _token.decimals()
            heritageAmountInNormalView = amount / Math.pow(10, _tokenDecimals)
            _remainingTime = remainingTime(timeWhenWithdraw)
            cutOwnerAddress = owner.slice(0, 6) + '...' + owner.slice(owner.length - 4, owner.length);
            cutHeirAddress = heir.slice(0, 6) + '...' + heir.slice(heir.length - 4, heir.length);
        }
        if (user !== null) {
            if (user.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
                    <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> добавил вас в своё завещание.\nПараметры завещания:\nНаследник - <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a>;\nТокен - ${_tokenSymbol};\nСумма - ${heritageAmountInNormalView};\nВремя до исполнения завещания - ${_remainingTime}.
                `, {parse_mode: 'HTML'})
            }
            // if (user.email.length > 0) {
            //     transporter.sendMail({
            //         from: process.env.EMAILUSER,
            //         to: user.email,
            //         subject: 'The Will',
            //         text: `${owner} добавил вас в наследники!\nВы можете забрать свои токены ${timeConverter(parseInt(timeWhenWithdraw))}`
            //     }, (err) => {
            //         if (err) {
            //             console.error(err)
            //         } else {
            //             console.log('Email sended')
            //         }
            //     })
            // }
        }
        if (_owner !== null) {
            if (_owner.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
                    Вы с адреса <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> создали завещание.\nПараметры завещания:\nНаследник - <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a>;\nТокен - ${_tokenSymbol};\nСумма - ${heritageAmountInNormalView};\nВремя до исполнения завещания - ${_remainingTime}.
                `, {parse_mode: 'HTML'})
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
                    <a href='https://mumbai.polygonscan.com/address/${owner}'>${cutOwnerAddress}</a> удалил вас из своего завещания.
                `, {parse_mode: 'HTML'})
            }
            // if (user.email.length > 0) {
            //     transporter.sendMail({
            //         from: process.env.EMAILUSER,
            //         to: user.email,
            //         subject: 'The Will',
            //         text: `${owner} добавил вас в наследники!\nВы можете забрать свои токены ${timeConverter(parseInt(timeWhenWithdraw))}`
            //     }, (err) => {
            //         if (err) {
            //             console.error(err)
            //         } else {
            //             console.log('Email sended')
            //         }
            //     })
            // }
        }
        if (_owner !== null) {
            if (_owner.tgID.length > 0) {
                await bot.sendMessage(_owner.tgID, `
                    Вы удалили <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a> из своего завещания.
                `, {parse_mode: 'HTML'})
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
                Ваше завещание исполнено. \nНаследник - <a href='https://mumbai.polygonscan.com/address/${heir}'>${cutHeirAddress}</a>.
                `, {parse_mode: 'HTML'})
            }
        }
    } catch (error) {
        
    }
})

setInterval(async () => {
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
                    const heritageAmountInNormalView = wills[j].amount / Math.pow(10, _tokenDecimals)
                    const cutHeirAddress = wills[j].heir.slice(0, 6) + '...' + wills[j].heir.slice(wills[j].heir.length - 4, wills[j].heir.length);
                    if (users[i].tgID.length > 0) {
                        if (remaining.includes('Nothing')) {
                            const alreadyExistInDB = await Will.find({ID: wills[j].ID})
                            if (alreadyExistInDB === null) {
                                const __heir = await User.findOne({address: wills[j].heir})
                                if (__heir !== null) {
                                    await bot.sendMessage(__heir.tgID, `
                                    Вы можете забрать токены. Параметры завещания:\nНаследник - <a href='https://mumbai.polygonscan.com/address/${wills[j].heir}'>${cutHeirAddress}</a>;\nТокен - ${_tokenSymbol};\nСумма - ${heritageAmountInNormalView};<a href='https://dwill.app/'>dWill</a>.
                                    `, {parse_mode: 'HTML'})
                                }
                                await bot.sendMessage(users[i].tgID, `
                                Ваше завещание будет исполнено. Параметры завещания:\nНаследник - <a href='https://mumbai.polygonscan.com/address/${wills[j].heir}'>${cutHeirAddress}</a>;\nТокен - ${_tokenSymbol};\nСумма - ${heritageAmountInNormalView};.
                                `, {parse_mode: 'HTML'})
                                const addToDB = new Will({ID: wills[j].ID, isLastMessageSended: true})
                                await addToDB.save()
                            }
                        } else {
                            await bot.sendMessage(users[i].tgID, `
                            Время до исполнения вашего завещания - ${remaining}\nПараметры завещания:\nНаследник - <a href='https://mumbai.polygonscan.com/address/${wills[j].heir}'>${cutHeirAddress}</a>;\nТокен - ${_tokenSymbol};\nСумма - ${heritageAmountInNormalView};.
                            `, {parse_mode: 'HTML'})
                        }
                    }
                }

            }
        }
    } catch (error) {
        console.error(error)
    }
}, 1000 * 86400)