const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "clearwarns",
            description: "Clears all the warns from an user.",
            category: "moderation",
            usage: "<user>",
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to remove the warnings.",
                    required: true
                }
            ],
            requireDatabase: true
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
                        .setDescription("You don't have permission to clear member warns.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        } else {
            if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setColor("RED")
                        .setDescription("You need the `MANAGE_GUILD` permission to clear member warns. \n\n> Ask a Server Admin to create a Moderator Role with `/config moderation moderator_role <role>` to allow a specific role to access moderation commands.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        }

        const user = message.options.getUser("user")

        const database = this.client.db.warns

        const results = await database.findOne({
            guildId: message.guild.id,
            userId: user.id
        })

        if (!results?.warnings || !results || !results?.warnings?.length === 0) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Error`)
                    .setDescription(`<@${user.id}> has no warnings.`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

        results.remove()

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`All the warnings from <@${user.id}> were removed.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

    }
}