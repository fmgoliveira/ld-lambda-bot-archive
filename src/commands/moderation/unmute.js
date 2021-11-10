const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "unmute",
            description: "Unmutes an user.",
            category: "moderation",
            usage: "<user>",
            requireDatabase: true,
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to unmute.",
                    required: true
                },
                {
                    name: "reason",
                    type: "STRING",
                    description: "The reason why you want to unmute the user.",
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
                        .setDescription("You don't have permission to unmute members.")
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
                        .setDescription("You need the `MANAGE_GUILD` permission to unmute members. \n\n> Ask a Server Admin to create a Moderator Role with `/config moderation moderator_role <role>` to allow a specific role to access moderation commands.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        }

        const user = message.options.getUser("user")

        const muteRole = message.guild.db.moderation?.mute_role
        const member = message.guild.members.cache.get(user.id)

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

        if (!member.roles.cache.some(r => r.id === muteRole)) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`<@${user.id}> is not muted.`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        if (member.roles.highest.position >= message.member.roles.highest.position) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't unmute users with a role above yours.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })
        if (message.guild.me.roles.highest.position <= member.roles.highest.position) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("I can't unmute this user, one of his roles is above mine.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        try {
            member.roles.remove(muteRole)
        } catch {
            console.log("Could not remove muted role to user.")
        }

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`<@${user.id}> was unmuted successfully.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

    }
}