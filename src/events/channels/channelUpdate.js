const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")
const placeholderReplace = require("../../structures/utils/placeholderReplace")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "channelUpdate"
        })
    }

    run = async (oldChannel, newChannel) => {
        const settings = await this.client.db.guilds.findOne({ guildId: newChannel.guild.id }) || new this.client.db.guilds({ guildId: newChannel.guild.id })
        const logging = settings.logging

        if (!logging.active.serverEvents.channelUpdate) return

        if (!logging.channel.serverEvents) return

        try {
            channel.guild.channels.cache.get(logging.channel.serverEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Channel updated")
                        .setDescription(`An existing channel was updated in <#${newChannel.id}>.`)
                        .addField("Name", `Old: \`${oldChannel.name}\`\nNew: \`${newChannel.name}\``)
                        .addField("Topic", `Old: \`${oldChannel.topic ? oldChannel.topic : "None"}\`\nNew: \`${newChannel.topic ? newChannel.topic : "None"}\``)
                        .addField("Type", `Old: \`${oldChannel.type}\`\nNew: \`${newChannel.type}\``)
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