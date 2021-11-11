const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = async (client, interaction) => {
    const data = interaction.options.getString("description")
    const database = interaction.guild.db

    if (JSON.stringify(database.tickets?.panel) === "{}" || !database.tickets || !database.tickets?.panel) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("There isn't any ticket panel created yet.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("<:logo:906086580354162698>")
                    .setLabel("Join Lambda Group")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )
        ]
    })

    const channel = client.channels.cache.get(database.tickets.panel.channel)
    var msg
    try {
        msg = await channel.messages.fetch(String(database.tickets.panel.msg))
    } catch {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("The ticket panel was deleted. Use `/panel remove` and then `/panel add` to re-create it.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.user.username, client.user.avatarURL())
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setEmoji("<:logo:906086580354162698>")
                        .setLabel("Join Lambda Group")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )
            ]
        })
    }

    if (msg.deleted) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("The ticket panel was deleted. Use `/panel remove` and then `/panel add` to re-create it.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("<:logo:906086580354162698>")
                    .setLabel("Join Lambda Group")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )
        ]
    })

    const title = msg.embeds[0].title
    const color = msg.embeds[0].color

    msg.edit({
        embeds: [
            new MessageEmbed()
                .setTitle(title)
                .setDescription(data)
                .setColor(color)
                .setFooter(client.user.username, client.user.avatarURL())
        ]
    })

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Successfully edited the ticket panel.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })
}