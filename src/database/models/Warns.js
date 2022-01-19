const { Schema, model } = require("mongoose")

const warnsSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    warnings: {
        type: Array,
        default: []
    }
})

module.exports = model("warns", warnsSchema)