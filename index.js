require("dotenv").config()

const Client = require("./src/structures/Client")
const client = new Client({
    intents: 32767
})

process.on('uncaughtException', (err) => {
    console.log(err);
})

process.on('unhandledRejection', (err) => {
    console.log(err);
})


client.login(process.env.BOT_TOKEN)