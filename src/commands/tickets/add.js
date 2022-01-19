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
        const user = message.options.getUser("user")

        message.channel.permissionOverwrites.edit(user, {"VIEW_CHANNEL": true, "SEND_MESSAGES": true} )

        message.reply({
            embeds: [new MessageEmbed()
                .setTitle("User Added")
                .setColor("GREEN")
                .setDescription(`Added <@${user.id}> to this ticket channel.`)
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ]

        })
    }
}