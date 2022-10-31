const mongoose = require('mongoose')

const {Schema, model} = require('mongoose')

const schema = new Schema({
    email:{
        type: String,
        required: false
    },
    tgID:{
        type: String,
        required: false
    },
    address: {
        type: String,
        required: true
    }
})

module.exports = model('User', schema)