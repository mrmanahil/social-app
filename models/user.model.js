const mongoose = require('mongoose')
const joi = require('joi')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    profilePicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String,
    },
    city:{
        type: String
    },
    from: {
        type: String
    },
    relation: {
        type: Number,
        enum: [1, 2, 3]
    }
});

// userSchema.method.joiValidationAuth = function(obj){
//     const schema = joi.object({
//         username: joi.string().min(3).max(30).required(),
//         email: joi.string().required(),
//         password: joi.string().min(6).required(),
//         profilePicture: joi.string(),
//     })
// }

module.exports = mongoose.model('User', userSchema);