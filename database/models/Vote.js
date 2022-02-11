const { Schema, model } = require("mongoose")

const votesSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    list: {
        type: String,
        required: true
    },
    timestamp : {
        type: String,
        required: true
    }
})

module.exports = model("votes", votesSchema)