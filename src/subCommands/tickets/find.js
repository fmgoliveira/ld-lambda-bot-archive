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

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Ticket panel")
            .setDescription("Have you lost your panel? No worries, click the button below to locate it.")
            .setColor("#ffa726")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("🧭")
                    .setLabel("Ticket Panel")
                    .setURL(database.tickets.panel.url)
                    .setStyle("LINK")
            )
        ]
    })
}