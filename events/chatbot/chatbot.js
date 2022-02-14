const { Message, Client } = require("discord.js")
const { chatSend } = require("../../utils/chatbot/chatSend")

module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {Message} message 
     * @param {Client} client 
     */
    async execute(message, client) {
        if (message.author.bot || message.channel.type === "DM") return

        const guildDb = await client.db.guilds.findOne({ guildId: message.guildId }) || client.db.guilds.create({ guildId: message.guildId })
        const channelsAllowed = guildDb.chatbotChannels

        if (!channelsAllowed.includes(message.channel.id)) return
        console.log("here")
        chatSend(message)
    }
}