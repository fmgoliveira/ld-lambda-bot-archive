const { Schema, model } = require("mongoose")

const bugsSchema = new Schema({
    content: String,
    user: String,
    guild: String,
    status: String
})

module.exports = model("bugs", bugsSchema)