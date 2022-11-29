import { ethers } from 'ethers'
import fetch from 'node-fetch'
import { update } from '../sheets.js'

export async function addAmountToPool(
    _tokenSymbol, amount, _balance, decimals
) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${_tokenSymbol}USDT`)
        const data = await response.json()
        //добавить распознование токенов и определение цены
        if (amount.toString() !== ethers.constants.MaxUint256.toString()) {
            if (data.price !== undefined) {
                await update(Math.floor(amount / Math.pow(10, decimals) * parseFloat(data.price)) + 1)
            } else {
                await update(Math.floor(amount / Math.pow(10, decimals) * 0.01) + 1)
            }
        } else {
            if (data.price !== undefined) {
                await update(Math.floor(_balance / Math.pow(10, decimals) * parseFloat(data.price)) + 1)
            } else {
                await update(Math.floor(_balance / Math.pow(10, decimals) * 0.01) + 1)
            }
        }
    } catch (error) {
        console.log(error)
    }
}
