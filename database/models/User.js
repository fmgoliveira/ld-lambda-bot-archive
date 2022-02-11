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
    }
})

module.exports = model("users", userSchema)