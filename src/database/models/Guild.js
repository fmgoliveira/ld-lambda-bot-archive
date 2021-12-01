const { Schema, model } = require("mongoose")

const guildSchema = new Schema({
    _id: String,
    welcome: {
        channel: String,
        role: String,
        message: String
    },
    moderation: {
        moderator_role: String,
        mute_role: String
    },
    tickets: {
        log_channel: String,
        support_role: String,
        category: String,
        closed_category: String,
        panel: {
            msg: Object,
            channel: String,
            url: String,
            disabled: Boolean
        },
        ticketCount: Number
    },
    verification: {
        role: String,
        panel: Object,
        inverse: Boolean
    }
})

module.exports = model("guilds", guildSchema)