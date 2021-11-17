const { Schema, model } = require("mongoose")

const transcriptSchema = new Schema({
    _id: String,
    content: Array
})

module.exports = model("transcripts", transcriptSchema)