// process.env.NTBA_FIX_319 = 1
const mongoose = require('mongoose')
const ethers = require('ethers')
const nodemailer = require('nodemailer')
require('dotenv').config()

const { bot, sendMessage } = require('./bot/bot');
const User = require('./db/User.js')
const WillAbi = require('../artifacts/contracts/TheWill.sol/TheWill.json')

const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com')
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract('0xd4094C1B574F7679190cf38fBeBE324A61be1831', WillAbi.abi, signer)

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

contract.on('AddAnHeir', async (ID,owner,heir,token,timeWhenWithdraw,amount) => {
    try {
        const user = await User.findOne({address: heir})
        if (user !== null) {
            if (user.tgID.length > 0) {
                await sendMessage(user.tgID, `${owner} добавил вас в наследники!`)
            }
            if (user.email.length > 0) {
                transporter.sendMail({
                    from: process.env.EMAILUSER,
                    to: user.email,
                    subject: 'The Will',
                    text: `${owner} добавил вас в наследники!`
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
