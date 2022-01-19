const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")
const inviteButton = require("../../structures/components/inviteButton")
const ms = require("ms")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "timeout",
            description: "Timeout an user.",
            category: "moderation",
            usage: "<user> <duration|off> (reason)",
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to timeout.",
                    required: true
                },
                {
                    name: "duration",
                    type: "STRING",
                    description: "How long do you want to timeout the user (use \"off\" to disable).",
                    required: true
                },
                {
                    name: "reason",
                    type: "STRING",
                    description: "The reason why you want to timeout the user.",
                    required: false
                }
            ],
            permissions: ["MODERATE_MEMBERS"],
            requireDatabase: true
        })
    }

    run = async (message) => {
        const user = message.options.getUser("user")
        const duration = message.options.getString("duration")
        const reason = message.options.getString('reason') || 'No reason specified.'
        const member = message.guild.members.cache.get(user.id)

        const timeInMs = ms(duration)

        if (message.user.id === user.id) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't timeout yourself.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        if (member.roles.highest.position >= message.member.roles.highest.position) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't timeout users with a role above yours.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })
        if (message.guild.me.roles.highest.position <= member.roles.highest.position || message.guild.ownerId === member.id) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("I can't timeout this user, one of his roles is above mine.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        if (duration === "off") {
            member.timeout(null)

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Success")
                        .setDescription(`Timeout has been removed from user.`)
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                        .setColor("#fff59d")
                ]
            })
        }

        if (!timeInMs) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("Please specify a valid duration (Eg. \`1d 3h 30m\`)")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                    .setTimestamp()
                    .setColor("RED")
            ],
            ephemeral: true,
            components: [new inviteButton()]
        })

        member.timeout(timeInMs, reason)

        if (message.guild.db.moderation.dm.ban) {
            try {
                user.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Banned")
                            .setColor("RED")
                            .setDescription(`You were banned from **${message.guild.name}**.`)
                            .addField("Reason", reason)
                            .addField("Moderator", message.member.user.tag)
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                    ]
                })
            } catch {
                console.log("Could not send message to user.")
            }
        }

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`<@${user.id}> has been timed out. ${message.guild.db.moderation.includeReason ? "| " + reason : ""}`)
                    .setColor("#fff59d")
            ]
        })
    }
}