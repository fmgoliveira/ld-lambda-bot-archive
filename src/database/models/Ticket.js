const { Schema, model } = require("mongoose")

const ticketSchema = new Schema({
    id: {
        type: String,
        required: true
    },

    guildId: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    user: {
        type: String,
        required: true
    },
    content: {
        type: Array,
        default: []
    },

    opened: {
        type: Boolean,
        default: true
    }
})

module.exports = model("tickets", ticketSchema)