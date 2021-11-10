const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "mute",
            description: "Mutes an user.",
            category: "moderation",
            usage: "<user> (reason)",
            requireDatabase: true,
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to mute.",
                    required: true
                },
                {
                    name: "reason",
                    type: "STRING",
                    description: "The reason why you want to mute the user.",
                    required: false
                }
            ]
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
                        .setDescription("You don't have permission to mute members.")
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
                        .setDescription("You need the `MANAGE_GUILD` permission to mute members. \n\n> Ask a Server Admin to create a Moderator Role with `/config moderation moderator_role <role>` to allow a specific role to access moderation commands.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        }

        const user = message.options.getUser("user")
        const reason = message.options.getString("reason") || "No reason specified"

        if (message.user.id === user.id) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't mute yourself. If you want, just be quiet.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        const member = message.guild.members.cache.get(user.id)

        if (member.roles.highest.position >= message.member.roles.highest.position) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't mute users with a role above yours.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })
        if (message.guild.me.roles.highest.position <= member.roles.highest.position) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("I can't mute this user, one of his roles is above mine.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        const muteRole = message.guild.db.moderation?.mute_role

        if (!muteRole) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setColor("RED")
                    .setDescription("There isn't any mute role set yet. Please use `/config moderation mute_role <role>` to set it.")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                    .setTimestamp()
            ],
            ephemeral: true
        })

        try {
            member.roles.add(muteRole)
        } catch {
            console.log("Could not add muted role to user.")
        }

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`<@${user.id}> was muted | ${reason}`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

    }
}