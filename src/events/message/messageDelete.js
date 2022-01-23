const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "messageDelete"
        })
    }

    run = async (message) => {
        const settings = await this.client.db.guilds.findOne({ guildId: message.guild.id }) || new this.client.db.guilds({ guildId: message.guild.id })
        const logging = settings.logging

        if (!logging.active.messageEvents.messageDelete) return

        if (!logging.channel.messageEvents) return

        try {
            channel.guild.channels.cache.get(logging.channel.messageEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Message deleted")
                        .setDescription(`A message was deleted in <#${message.channel.id}>.`)
                        .addField("Author", `<@${message.author.id}> (${message.author.tag} - \`${message.author.id}\`)`)
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