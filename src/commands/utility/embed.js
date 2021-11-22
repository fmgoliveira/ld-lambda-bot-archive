const { MessageEmbed, Permissions } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "embed",
            description: "Create an embed message.",
            options: [
                {
                    name: "title",
                    type: "STRING",
                    description: "The embed title.",
                    required: true
                },
                {
                    name: "description",
                    type: "STRING",
                    description: "The embed description.",
                    required: true
                },
                {
                    name: "author",
                    type: "STRING",
                    description: "The embed author name.",
                    required: false
                },
                {
                    name: "author_avatar",
                    type: "STRING",
                    description: "The embed author image url.",
                    required: false
                },
                {
                    name: "thumbnail",
                    type: "STRING",
                    description: "The embed thumbnail url.",
                    required: false
                },
                {
                    name: "image",
                    type: "STRING",
                    description: "The embed image url.",
                    required: false
                },
                {
                    name: "footer_text",
                    type: "STRING",
                    description: "The embed footer text.",
                    required: false
                },
                {
                    name: "footer_image",
                    type: "STRING",
                    description: "The embed footer image url.",
                    required: false
                },
                {
                    name: "channel",
                    type: "CHANNEL",
                    description: "The channel where the embed will be sent.",
                    required: false
                }
            ],
            category: "utility",
            usage: "<title> <description> (author) (author_url) (thumbnail) (image) (footer_text) (footer_image) (channel)"
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

        const title = message.options.getString("title")
        const description = message.options.getString("description")
        const author = message.options.getString("author")
        const author_avatar = message.options.getString("author_avatar")
        const thumbnail = message.options.getString("thumbnail")
        const image = message.options.getString("image")
        const footer_text = message.options.getString("footer_text")
        const footer_image = message.options.getString("footer_image")

        const embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor("RANDOM")
            .setTimestamp()
        
        if (author) {
            if (author_avatar) embed.setAuthor(author, author_avatar)
            else embed.setAuthor(author)
        }

        if (thumbnail) embed.setThumbnail(thumbnail)
        if (image) embed.setImage(image)
        if (footer_text) {
            if (footer_image) embed.setFooter(footer_text, footer_image)
            else embed.setFooter(footer_text)
        }

        channel.send({ embeds: [ embed ] }).then(() => {
            message.reply({
                embeds: [new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Embed sent successfully in channel <#${channel.id}>.`)
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