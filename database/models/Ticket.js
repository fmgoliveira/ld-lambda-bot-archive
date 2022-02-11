const { Schema, model } = require("mongoose")

const ticketSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },

    memberId: {
        type: String,
        required: true
    },
    otherMembers: {
        type: [String],
        default: []
    },
    ticketId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },

    closed: {
        type: Boolean,
        default: false
    },
    locked: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: null
    },
    
    claimed : {
        type: Boolean,
        default: false
    },
    claimedBy: {
        type: String,
        default: null
    }
})

module.exports = model("tickets", ticketSchema)