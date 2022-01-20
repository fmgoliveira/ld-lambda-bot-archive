const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")
const placeholderReplace = require("../../structures/utils/placeholderReplace")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "channelDelete"
        })
    }

    run = async (channel) => {
        const settings = await this.client.db.guilds.findOne({ guildId: member.guild.id }) || new this.client.db.guilds({ guildId: member.guild.id })
        const logging = settings.logging

        if (!logging.active.serverEvents.channelDelete) return

        if (!logging.channel.serverEvents) return

        try {
            channel.guild.channels.cache.get(logging.channel.serverEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Channel deleted")
                        .setDescription(`An existing channel was deleted.`)
                        .addField("Channel", `${channel.name}`, true)
                        .addField("Channel ID", `${channel.id}`, true)
                        .addField("Category", `${channel.parent.name}`, true)
                        .setTimestamp()
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setColor(logging.color.serverEvents)
                ]
            })
        } catch (err) {
            console.log(err)
        }
    }
}