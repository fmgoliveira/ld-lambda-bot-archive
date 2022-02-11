const { Schema, model } = require("mongoose")

const bugsSchema = new Schema({
    content: {
        type: String,
        default: "No content provided"
    },
    user: {
        type: String,
        required: true
    },
    guild: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: "Sent"
    }
})

module.exports = model("bugs", bugsSchema)