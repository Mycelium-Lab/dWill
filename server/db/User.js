import mongoose, {Schema, model} from 'mongoose'

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

export default model('User', schema)