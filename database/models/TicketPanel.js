const { Schema, model } = require("mongoose")

const ticketSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: "Open a ticket"
    },
    maxTickets: {
        type: Number,
        default: 0
    },
    supportRole: {
        type: String,
        default: null
    },

    welcomeMessage: {
        message: {
            type: String,
            default: "Hey {user}! Welcome to your ticket! Thank you for creating a ticket, the support team will be with you shortly. Meanwhile, please explain your issue below"
        },
        color: {
            type: String,
            default: "#000000"
        }
    }
})

module.exports = model("ticketPanels", ticketSchema)