const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "messageUpdate"
        })
    }

    run = async (oldMessage, newMessage) => {
        if (oldMessage.author.bot) return
        if (oldMessage.content === newMessage.content) return

        const settings = await this.client.db.guilds.findOne({ guildId: newMessage.guild.id }) || new this.client.db.guilds({ guildId: newMessage.guild.id })
        const logging = settings.logging

        if (!logging.active.messageEvents.messageEdit) return
        if (!logging.channel.messageEvents) return

        const count = 1024
        const Original = oldMessage.content.slice(0, count) + (oldMessage.content.lenght > count ? "..." : "")
        const Edited = newMessage.content.slice(0, count) + (newMessage.content.lenght > count ? "..." : "")

        try {
            newMessage.guild.channels.cache.get(logging.channel.messageEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Message edited")
                        .setDescription(`A message was updated in <#${newMessage.channel.id}>.`)
                        .addField("Old message", Original)
                        .addField("New message", Edited)
                        .addField("User", `<@${newMessage.author.id}> (${newMessage.author.tag} - \`${newMessage.author.id}\`)`)
                        .addField("Jump to message", `[Click here](${newMessage.url})`)
                        .setTimestamp()
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setColor(logging.color.messageEvents)
                ]
            })
        } catch (err) {
            console.log(err)
        }
    }
}