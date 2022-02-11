const { MessageEmbed, Message, Client } = require("discord.js")

module.exports = {
    name: "messageDelete",
    /**
     * 
     * @param {Message} message 
     */
    async execute(message, client) {
        if (message.author.bot) return

        const settings = await client.db.guilds.findOne({ guildId: message.guild.id }) || new client.db.guilds({ guildId: message.guild.id })
        const logging = settings.logging

        if (!logging.active.messageEvents.messageDelete) return
        if (!logging.channel.messageEvents) return

        const count = 1021
        const content = message.content ? message.content.slice(0, count) + (message.content.length > count ? "..." : "") : ""
        
        try {
            message.guild.channels.cache.get(logging.channel.messageEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`**A message was deleted** in <#${message.channel.id}>.`)
                        .addField("Message Content", content)
                        .addField("Author", `<@${message.author.id}> (${message.author.tag} - \`${message.author.id}\`)`)
                        .setTimestamp()
                        .setColor(logging.color.messageEvents)
                ]
            })
        } catch (err) {
            console.log(err)
        }
    }
}