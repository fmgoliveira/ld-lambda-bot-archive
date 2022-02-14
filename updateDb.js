const Models = require("./database/models/Models")
const mongoose = require("mongoose")
require("dotenv").config()

const connectToDatabase = async () => {
    const connection = mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log("Connected to MongoDB database successfully.");

    (await Models.guilds.find({})).forEach(async (doc) => {
        doc.chatbotChannel = []
        await doc.save()
    })


    console.log("Updated data.")

}

connectToDatabase()