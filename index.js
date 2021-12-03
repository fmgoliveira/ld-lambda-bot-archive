require("dotenv").config()

const Client = require("./src/structures/Client")

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_MESSAGES",
        "GUILD_INVITES",
        "GUILD_VOICE_STATES",
        "GUILD_MEMBERS",
        "GUILD_PRESENCES",
        "GUILD_BANS",
        "GUILD_EMOJIS_AND_STICKERS",
        "GUILD_INTEGRATIONS",
        "GUILD_WEBHOOKS",
        "GUILD_MESSAGE_TYPING",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS",
        "DIRECT_MESSAGE_TYPING"
    ]
})

// client.login(process.env.BETA_TOKEN)
client.login(process.env.BOT_TOKEN)