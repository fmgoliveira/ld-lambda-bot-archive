const { Message, Client } = require("discord.js")

module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {Message} message 
     * @param {Client} client 
     */
    async execute(message, client) {
        if (message.channel.type === "DM") return

        const reactsDb = await client.db.autoReact.findOne({ guildId: message.guildId, channelId: message.channelId })
        if (!reactsDb) return

        reactsDb.emojis.forEach(emoji => {
            var emoj = emoji.trim()
            message.react(message.guild.emojis.cache.get(emoj) ? message.guild.emojis.cache.get(emoj) : emoj).catch(e => {
                console.log(e)
                message.react("⁉")
            })
        })
    }
}