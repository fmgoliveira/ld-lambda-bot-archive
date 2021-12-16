const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = (client, interaction) => {
    const database = interaction.guild.db

    if (!database.tickets?.category) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("Ticket category is not set yet. Use `/config tickets category <category>` to set it first.")
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

    if (JSON.stringify(database.tickets?.panel) !== "{}") return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("Ticket panels are limited to one per server.")
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

    interaction.channel.send({
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
        ],
        fetchReply: true
    }).then(msg => {
        if (database.tickets) database.tickets.panel = {
            msg,
            channel: interaction.channel.id,
            url: msg.url,
            disabled: false
        }
        else database.tickets = {
            panel: {
                msg,
                channel: interaction.channel.id,
                url: msg.url,
                disabled: false
            }
        }

        database.save()

        return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle("Success")
                .setDescription("Ticket panel created successfully.")
                .setColor("#fff59d")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
            ],
            ephemeral: true
        })
    })
}