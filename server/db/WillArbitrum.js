import mongoose, {Schema, model} from 'mongoose'

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

export default model('WillArbitrum', schema)