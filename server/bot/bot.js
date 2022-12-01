// process.env.NTBA_FIX_319 = 1

import TelegramBot from "node-telegram-bot-api";
import User from '../db/User.js'
import dotenv from 'dotenv'
dotenv.config()

export const bot = new TelegramBot(process.env.TGBOT, {polling:true})

const keyboardOptions = {
    reply_markup: JSON.stringify({
        keyboard: [
          [{ text: 'Add wallet address for tracking', callback_data: 'address' }],
          [{ text: 'Add email for notifications', callback_data: 'email' }]
        ],
        resize_keyboard: true
      })
}

const keyboardOptionsWithoutEmail = {
    reply_markup: JSON.stringify({
        keyboard: [
          [{ text: 'Add wallet address for tracking', callback_data: 'address' }]
        ],
        resize_keyboard: true
      })
}

bot.onText(/\/start/, async function(msg){
    let userID = msg.from.id
    const user = await User.findOne({tgID: userID})
    let keyboard;
    if (user !== null) {
        if (user.address !== null || user.address === '' || user.address !== undefined) {
            keyboard = keyboardOptions
        } else {
            keyboard = keyboardOptionsWithoutEmail
        }
    } else {
        keyboard = keyboardOptionsWithoutEmail
    }
    await bot.sendMessage(userID, `Hello!

This is the official bot-notifier of the dWill project.

Official website: <a href='https://dwill.app/'>dwill.app</a>

Add your wallet address and the bot will automatically start tracking information about your wills.

Bot features:
▪️ Tracking your dWills
▪️ Tracking dWills intended for you
▪️ Reminding you about major timer events`, {parse_mode:'HTML', reply_markup: keyboard.reply_markup})
})

bot.onText(/Add wallet address for tracking/, async (msg) => {
    let userID = msg.from.id
    const addressPrompt = await bot.sendMessage(userID, 'Your address', {
        reply_markup: {
            force_reply: true,
        },
    })
    bot.onReplyToMessage(msg.chat.id, addressPrompt.message_id, async (_msg) => {
        if (
            _msg.text.length < 42 
            && 
            !_msg.text.includes('Add')
            &&
            !_msg.text.includes('start')
        ) {
            await bot.sendMessage(userID, 'Incorrect wallet address format', keyboardOptions)
        } else if (
            !_msg.text.includes('Add')
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
                                    await bot.sendMessage(userID, 'Your wallet address has been updated. You will now receive alerts related to dWills of that wallet address', keyboardOptions)
                                } else {
                                    await bot.sendMessage(userID, 'Something went wrong', keyboardOptionsWithoutEmail)
                                }
                            })
                        } else {
                            await bot.sendMessage(userID, 'Your wallet address has been updated. You will now receive alerts related to dWills of that wallet address', keyboardOptions)
                        }
                    } else {
                        try {
                            const user = await User.findOne({tgID: userID})
                            let keyboard;
                            if (user !== null) {
                                if (user.address !== null || user.address === '' || user.address !== undefined) {
                                    keyboard = keyboardOptions
                                } else {
                                    keyboard = keyboardOptionsWithoutEmail
                                }
                            } else {
                                keyboard = keyboardOptionsWithoutEmail
                            }
                            await bot.sendMessage(userID, 'An error has occurred', keyboard)
                        } catch (error) {
                            console.error(error)
                        }
                    }
                }
            )
        }
    })
});

bot.onText(/Add email for notifications/, async (msg) => {
    let userID = msg.from.id
    const emailPrompt = await bot.sendMessage(userID, 'Your email', {
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
            await bot.sendMessage(userID, 'Invalid format', keyboardOptions)
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
                                    await bot.sendMessage(userID, 'Your email has been updated. You will now receive alerts related to your dWill at this address.', keyboardOptions)
                                } else {
                                    await bot.sendMessage(userID, 'An error has occurred', keyboardOptions)
                                }
                            })
                        } else {
                            await bot.sendMessage(userID, 'Your email has been updated. You will now receive alerts related to your dWill at this address.', keyboardOptions)
                        }
                    } else {
                        await bot.sendMessage(userID, 'An error has occurred', keyboardOptions)
                    }
                }
            )
        }
    })
});

bot.on("polling_error", console.log);

export async function sendMessage(userID, msg) {
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
