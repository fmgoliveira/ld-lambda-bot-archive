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
                    .setEmoji("<:logo:906086580354162698>")
                    .setLabel("Join Lambda Group")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )
        ]
    })

    const channel = client.channels.cache.get(database.tickets.panel.channel)
    try {
        const msg = await channel.messages.fetch(String(database.tickets.panel.msg))
        msg.delete()
    } catch {}

    database.tickets.panel = {}
    database.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Ticket panel removed successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })
}