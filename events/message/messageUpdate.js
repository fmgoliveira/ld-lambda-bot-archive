const { MessageEmbed, Message, Client } = require("discord.js")

module.exports = {
    name: "messageUpdate",
    /**
     * 
     * @param {Message} oldMessage 
     * @param {Message} newMessage 
     */
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.author.bot) return
        if (oldMessage.content === newMessage.content) return

        const settings = await client.db.guilds.findOne({ guildId: oldMessage.guild.id }) || new client.db.guilds({ guildId: oldMessage.guild.id })
        const logging = settings.logging

        if (!logging.active.messageEvents.messageEdit) return
        if (!logging.channel.messageEvents) return

        const count = 1021
        const original = oldMessage.content.slice(0, count) + (oldMessage.content.length > count ? "..." : "")
        const edited = newMessage.content.slice(0, count) + (newMessage.content.length > count ? "..." : "")
        
        try {
            newMessage.guild.channels.cache.get(logging.channel.messageEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`**A message was edited** in <#${newMessage.channel.id}>.`)
                        .addField("Old message", original)
                        .addField("New message", edited)
                        .addField("User", `<@${newMessage.author.id}> (${newMessage.author.tag} - \`${newMessage.author.id}\`)`)
                        .addField("Jump to message", `[Click here](${newMessage.url})`)
                        .setTimestamp()
                        .setColor(logging.color.messageEvents)
                ]
            })
        } catch (err) {
            console.log(err)
        }
    }
}