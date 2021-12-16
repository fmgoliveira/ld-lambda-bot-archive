const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = async (client, interaction) => {
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
                    .setEmoji("<:logo:921033010764218428>")
                    .setLabel("Join Lambda Development")
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
                        .setEmoji("<:logo:921033010764218428>")
                        .setLabel("Join Lambda Development")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )
            ]
        })
    }
    const disabled = database.tickets.panel.disabled

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
                    .setEmoji("<:logo:921033010764218428>")
                    .setLabel("Join Lambda Development")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )
        ]
    })

    if (!disabled) {
        msg.edit({
            embeds: [
                new MessageEmbed()
                    .setTitle("Support")
                    .setDescription(`Sorry! The support team of **${interaction.guild.name}** is not accepting new tickets right now. Please try again later.`)
                    .setColor("RED")
                    .setFooter(client.user.username, client.user.avatarURL())
            ],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setEmoji("📨")
                        .setLabel("Create Ticket")
                        .setCustomId("ticket-create")
                        .setStyle("DANGER")
                        .setDisabled(true)
                )
            ]
        })

        database.tickets.panel.disabled = true
        database.save()

        return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle("Success")
                .setDescription("Successfully disabled the ticket panel.")
                .setColor("#fff59d")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
            ],
            ephemeral: true
        })
    }

    msg.edit({
        embeds: [
            new MessageEmbed()
                .setTitle("Support")
                .setDescription(`Click the button below to create a ticket and get assisted by **${interaction.guild.name}** support team.`)
                .setColor("GREEN")
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("📨")
                    .setLabel("Create Ticket")
                    .setCustomId("ticket-create")
                    .setStyle("SUCCESS")
            )
        ]
    })

    database.tickets.panel.disabled = false
    database.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Successfully enabled the ticket panel.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })
}