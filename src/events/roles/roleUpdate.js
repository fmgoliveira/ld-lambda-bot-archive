const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")
const placeholderReplace = require("../../structures/utils/placeholderReplace")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "roleUpdate"
        })
    }

    run = async (oldRole, newRole) => {
        const settings = await this.client.db.guilds.findOne({ guildId: member.guild.id }) || new this.client.db.guilds({ guildId: member.guild.id })
        const logging = settings.logging

        if (!logging.active.serverEvents.roleUpdate) return

        if (!logging.channel.serverEvents) return

        try {
            channel.guild.channels.cache.get(logging.channel.serverEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Role updated")
                        .setDescription(`An existing channel was updated: <@&${newRole.id}>.`)
                        .addField("Name", `Old: \`${oldRole.name}\`\nNew: \`${newRole.name}\``)
                        .addField("Colour", `Old: \`${oldRole.hexColor === "#000000" ? oldRole.hexColor : "Not set"}\`\nNew: \`${newRole.hexColor === "#000000" ? newRole.hexColor : "Not set"}\``)
                        .addField("Raw position", `Old: \`${oldRole.rawPosition}\`\nNew: \`${newRole.rawPosition}\``)
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