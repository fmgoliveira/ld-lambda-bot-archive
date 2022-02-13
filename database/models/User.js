const { Schema, model } = require("mongoose")

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    blacklisted: {
        type: Boolean,
        default: false
    },
    acceptedPolicy: {
        type: Boolean,
        default: true
    },
    voted: {
        type: Boolean,
        default: false
    },
    voteAmount: {
        type: Number,
        default: 0
    }
})

module.exports = model("users", userSchema)