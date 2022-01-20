require("dotenv").config()

const Client = require("./src/structures/Client")
const client = new Client({
    intents: 32767
})


client.login(process.env.TOKEN)