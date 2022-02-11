const { Schema, model } = require("mongoose")

const bugsSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: null
    },
    time: {
        type: String,
        default: null
    }
})

module.exports = model("afkSystem", bugsSchema)