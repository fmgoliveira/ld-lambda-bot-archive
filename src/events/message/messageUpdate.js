const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "messageUpdate"
        })
    }

    run = async (oldMessage, newMessage) => {
        const settings = await this.client.db.guilds.findOne({ guildId: newMessage.guild.id }) || new this.client.db.guilds({ guildId: newMessage.guild.id })
        const logging = settings.logging

        if (!logging.active.messageEvents.messageEdit) return

        if (!logging.channel.messageEvents) return

        try {
            channel.guild.channels.cache.get(logging.channel.messageEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Message edited")
                        .setDescription(`A message was updated in <#${newMessage.channel.id}>.`)
                        .addField("Old message", oldMessage.length < 1024 && oldMessage.lenght > 0 ? oldMessage : oldMessage.substring(0, 1020) + "...")
                        .addField("New message", oldMessage.length < 1024 && oldMessage.lenght > 0 ? oldMessage : oldMessage.substring(0, 1020) + "...")
                        .addField("User", `<@${newMessage.author.id}> (${newMessage.author.tag} - \`${newMessage.author.id}\`)`)
                        .addField(`Jump to message", "[Click here](${newMessage.url})`)
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