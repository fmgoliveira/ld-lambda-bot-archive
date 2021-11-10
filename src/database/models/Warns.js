const { Schema, model } = require("mongoose")

const warnsSchema = new Schema({
    guildId: String,
    userId: String,
    warnings: [Object]
})

module.exports = model("warns", warnsSchema)