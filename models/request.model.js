const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {
        type: String,
        default: 'Pending'
    },
    sendTo: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

const Request = mongoose.model('Request', requestSchema)
module.exports = Request