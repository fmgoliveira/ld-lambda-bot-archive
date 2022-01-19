const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "remove",
            description: "Removes a user from the ticket channel.",
            category: "tickets",
            usage: "<user>",
            requireDatabase: true,
            options: [
                {
                    type: "USER",
                    name: "user",
                    description: "The user you want to remove from the ticket",
                    required: true
                }
            ]
        })
    }

    run = async (message) => {
        const user = message.options.getUser("user")

        message.channel.permissionOverwrites.edit(user, {"VIEW_CHANNEL": false, "SEND_MESSAGES": false} )

        message.reply({
            embeds: [new MessageEmbed()
                .setTitle("User Removed")
                .setColor("RED")
                .setDescription(`Removed <@${user.id}> from this ticket channel.`)
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ]

        })
    }
}