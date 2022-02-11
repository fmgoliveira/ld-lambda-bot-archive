const { Schema, model } = require("mongoose")

const logsSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    user: {
        type: Object,
        required: true,
        id: String,
        username: String,
        tag: String,
        avatar: String
    }
})

module.exports = model("logs", logsSchema)