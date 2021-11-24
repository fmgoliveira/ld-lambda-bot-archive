const { MessageEmbed, Permissions } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            description: "Make the bot say something.",
            options: [
                {
                    name: "message",
                    type: "STRING",
                    description: "The message the bot will say.",
                    required: true
                },
                {
                    name: "channel",
                    type: "CHANNEL",
                    description: "Channel where the message will be sent.",
                    required: false
                }
            ],
            category: "utility",
            usage: "<message> (channel)"
        })
    }

    run = (message) => {
        var channel = message.options.getChannel("channel")

        if (!channel) channel = message.channel

        if (!["GUILD_TEXT", "GUILD_ANNOUNCEMENTS"].includes(channel.type)) return message.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setDescription("Please inform a valid text/announcement channel.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            ephemeral: true
        })

        if (!channel.permissionsFor(message.member).has(Permissions.FLAGS.SEND_MESSAGES)) return message.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setDescription("You don't have permission to send messages in that channel.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            ephemeral: true
        })

        let text = message.options.getString("message")

        if (text.includes("@everyone") && !channel.permissionsFor(message.member).has(Permissions.FLAGS.MENTION_EVERYONE)) text = text.replace("@everyone", "@ everyone")
        if (text.includes("@here") && !channel.permissionsFor(message.member).has(Permissions.FLAGS.MENTION_EVERYONE)) text = text.replace("@here", "@ here")

        channel.send({ content: text }).then(() => {
            message.reply({
                embeds: [new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Message sent successfully in channel <#${channel.id}>.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                ],
                ephemeral: true
            })
        }).catch(() => {
            message.reply({
                embeds: [new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("I could not send the message in that channel.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                ],
                ephemeral: true
            })
        })
    }
}