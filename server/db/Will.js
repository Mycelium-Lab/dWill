const mongoose = require('mongoose')

const {Schema, model} = require('mongoose')

const schema = new Schema({
    ID:{
        type: String,
        required: true
    },
    isLastMessageSended: {
        type: Boolean,
        required: true
    }
})

module.exports = model('Will', schema)