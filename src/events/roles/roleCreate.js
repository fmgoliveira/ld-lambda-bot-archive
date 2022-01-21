const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")
const placeholderReplace = require("../../structures/utils/placeholderReplace")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "roleCreate"
        })
    }

    run = async (role) => {
        const settings = await this.client.db.guilds.findOne({ guildId: role.guild.id }) || new this.client.db.guilds({ guildId: role.guild.id })
        const logging = settings.logging

        if (!logging.active.serverEvents.roleCreateDelete) return

        if (!logging.channel.serverEvents) return

        try {
            channel.guild.channels.cache.get(logging.channel.serverEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Role created")
                        .setDescription(`A new role was created: <@&${role.id}>.`)
                        .addField("Role", `<@&${role.id}>`, true)
                        .addField("Role ID", `${role.id}`, true)
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