const { Schema, model } = require("mongoose")

const autoReactSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    emojis: {
        type: Array,
        default: []
    }
})

module.exports = model("autoReact", autoReactSchema)