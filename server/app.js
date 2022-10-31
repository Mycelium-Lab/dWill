// process.env.NTBA_FIX_319 = 1
const mongoose = require('mongoose')
const ethers = require('ethers')
const nodemailer = require('nodemailer')
require('dotenv').config()

const { bot, sendMessage } = require('./bot/bot');
const User = require('./db/User.js')
const WillAbi = require('../artifacts/contracts/TheWill.sol/TheWill.json')

const provider = new ethers.providers.WebSocketProvider(process.env.RPC)
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT, WillAbi.abi, signer)

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

contract.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    try {
        const user = await User.findOne({address: heir})
        if (user !== null) {
            if (user.tgID.length > 0) {
                await sendMessage(user.tgID, `${owner} добавил вас в наследники!\nВы можете забрать свои токены ${timeConverter(parseInt(timeWhenWithdraw))}`)
            }
            if (user.email.length > 0) {
                transporter.sendMail({
                    from: process.env.EMAILUSER,
                    to: user.email,
                    subject: 'The Will',
                    text: `${owner} добавил вас в наследники!\nВы можете забрать свои токены ${timeConverter(parseInt(timeWhenWithdraw))}`
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
})
