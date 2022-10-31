// process.env.NTBA_FIX_319 = 1

const TelegramBot = require("node-telegram-bot-api");
const User = require('../db/User.js')
require('dotenv').config()

const bot = new TelegramBot(process.env.TGBOT, {polling:true})

const keyboardOptions = {
    reply_markup: JSON.stringify({
        keyboard: [
          [{ text: 'Добавить адрес', callback_data: 'address' }],
          [{ text: 'Добавить email', callback_data: 'email' }]
        ],
        resize_keyboard: true
      })
}
try {
    
    bot.onText(/\/start/, async function(msg){
        let userID = msg.from.id
        await bot.sendMessage(userID, 'Добро пожаловать в TheWill', keyboardOptions)
    })

    bot.onText(/Добавить адрес/, async (msg) => {
        let userID = msg.from.id
        const addressPrompt = await bot.sendMessage(userID, 'Напишите адрес', {
            reply_markup: {
                force_reply: true,
            },
        })
        bot.onReplyToMessage(msg.chat.id, addressPrompt.message_id, async (_msg) => {
            if (
                _msg.text.length < 42 
                && 
                !_msg.text.includes('Добавить')
                &&
                !_msg.text.includes('start')
            ) {
                await bot.sendMessage(userID, 'Неверный формат', keyboardOptions)
            } else if (
                !_msg.text.includes('Добавить')
                &&
                !_msg.text.includes('start')
            ) {
                User.findOneAndUpdate(
                    {tgID: _msg.from.id}, 
                    {address: _msg.text}, 
                    async (err, result) => {
                        if (!err) {
                            if (!result) {
                                result = new User({address: _msg.text, tgID: _msg.from.id}) 
                                result.save(async (err) => {
                                    if (!err) {
                                        await bot.sendMessage(userID, 'Добавлен адрес\nТеперь вам будут приходить оповещения с TheWill', keyboardOptions)
                                    } else {
                                        await bot.sendMessage(userID, 'Произошла ошибка', keyboardOptions)
                                    }
                                })
                            } else {
                                await bot.sendMessage(userID, 'Обновлен адрес\nТеперь вам будут приходить оповещения с TheWill', keyboardOptions)
                            }
                        } else {
                            await bot.sendMessage(userID, 'Произошла ошибка', keyboardOptions)
                        }
                    }
                )
            }
        })
    });

    bot.onText(/Добавить email/, async (msg) => {
        let userID = msg.from.id
        const emailPrompt = await bot.sendMessage(userID, 'Напишите email', {
            reply_markup: {
                force_reply: true,
            },
        })
        bot.onReplyToMessage(msg.chat.id, emailPrompt.message_id, async (_msg) => {
            if (
                !_msg.text.includes('@')
                &&
                !_msg.text.includes('.')
            ) {
                await bot.sendMessage(userID, 'Неверный формат', keyboardOptions)
            } else if (
                _msg.text.includes('@')
                &&
                _msg.text.includes('.')
            ) {
                User.findOneAndUpdate(
                    {tgID: _msg.from.id}, 
                    {email: _msg.text}, 
                    async (err, result) => {
                        if (!err) {
                            if (!result) {
                                result = new User({email: _msg.text, tgID: _msg.from.id}) 
                                result.save(async (err) => {
                                    if (!err) {
                                        await bot.sendMessage(userID, 'Добавлен email\nТеперь вам будут приходить оповещения с TheWill', keyboardOptions)
                                    } else {
                                        await bot.sendMessage(userID, 'Произошла ошибка', keyboardOptions)
                                    }
                                })
                            } else {
                                await bot.sendMessage(userID, 'Обновлен email\nТеперь вам будут приходить оповещения с TheWill', keyboardOptions)
                            }
                        } else {
                            await bot.sendMessage(userID, 'Произошла ошибка', keyboardOptions)
                        }
                    }
                )
            }
        })
    });

    bot.on("polling_error", console.log);
} catch (error) {
    console.error(error)
}

async function sendMessage(userID, msg) {
    try {
        await bot.sendMessage(userID, msg)
        .then(() => {
            console.log(`Message sended`)
        })
        .catch((error) => {
            console.error(error)
        })
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    bot,
    sendMessage
}