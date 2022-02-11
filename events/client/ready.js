const { Client } = require("discord.js")
const mongoose = require("mongoose")
const Models = require("../../database/models/Models")

module.exports = {
    name: "ready",
    once: true,
    /**
     * 
     * @param {Client} client 
     */
    execute(client) {
        const connectToDatabase = (client) => {
            const connection = mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })

            client.db = { connection, ...Models }

            console.log("Connected to MongoDB database successfully.")
        }

        console.log(`Bot logged in as ${client.user.tag} in ${client.guilds.cache.size} guilds successfully.`)

        client.footer = { text: client.user.username, iconURL: client.user.avatarURL() }

        client.updateStatus(client)
        connectToDatabase(client)
        require("../../dashboard/index")(client)
        require("../../systems/voteSystem")(client)
    }
}