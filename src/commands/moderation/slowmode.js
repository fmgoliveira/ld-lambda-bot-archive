const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "slowmode",
            description: "Changes a channel slowmode.",
            options: [
                {
                    name: "seconds",
                    type: "NUMBER",
                    description: "The amount of seconds that the slowmode will be set to.",
                    required: true
                }
            ],
            category: "moderation",
            usage: "<seconds>"
        })
    }

    run = async (message) => {
        let roleId

        if (message.guild.db?.moderation?.moderator_role) { roleId = message.guild.db.moderation.moderator_role }

        if (roleId) {
            if (!message.member.roles.cache.some(r => r.id === roleId)) return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setColor("RED")
                        .setDescription("You don't have permission to change a channel slowmode.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        } else {
            if (!message.member.permissions.has("MANAGE_CHANNELS")) return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setColor("RED")
                        .setDescription("You need the `MANAGE_CHANNELS` permission to change a channel slowmode. \n\n> Ask a Server Admin to create a Moderator Role with `/config moderation moderator_role <role>` to allow a specific role to access moderation commands.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        }

        const amount = message.options.getNumber('seconds')
        const { channel } = message

        channel.setRateLimitPerUser(amount)

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Successfully changed the slowmode of this channel to \`${amount}\`.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })
    }
}