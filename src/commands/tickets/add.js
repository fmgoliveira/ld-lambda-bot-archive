const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "add",
            description: "Adds a user to the ticket channel.",
            category: "tickets",
            requireDatabase: true,
            usage: "<user>",
            options: [
                {
                    type: "USER",
                    name: "user",
                    description: "The user you want to add to the ticket",
                    required: true
                }
            ]
        })
    }

    run = async (message) => {
        if (!message.guild.db.tickets?.support_role) {
            if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply({
                embeds: [new MessageEmbed()
                    .setTitle("Error")
                    .setColor("RED")
                    .setDescription("You do not have permission to use this command. \n\n> You need the `MANAGE_GUILD` permission to do that.\n\n*You can set a specific tickets role by using `/config tickets support_role <role>`.*")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                    .setTimestamp()
                ],
                ephemeral: true
            })
        } else if (!message.member.roles.cache.some(role => role.id === message.guild.db.tickets.support_role)) return message.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setColor("RED")
                .setDescription("You do not have permission to use this command.")
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ],
            ephemeral: true
        })

        if (!message.guild.db.tickets?.category || message.channel.parentId !== message.guild.db.tickets?.category) return message.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setColor("RED")
                .setDescription("You can only use this command in a ticket channel.")
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ],
            ephemeral: true
        })

        const user = message.options.getUser("user")

        message.channel.permissionOverwrites.edit(user, {"VIEW_CHANNEL": true, "SEND_MESSAGES": true} )

        message.reply({
            embeds: [new MessageEmbed()
                .setTitle("User Added")
                .setColor("GREEN")
                .setDescription(`Added <@${user.id}> to this ticket thread.`)
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ]

        })
    }
}