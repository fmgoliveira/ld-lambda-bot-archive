const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    if (!interaction.guild.db.tickets.closed_category) return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("There isn't any closed ticket category set yet.\n\n> You can set it with `/config tickets closed_category <category>`")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    interaction.guild.db.tickets.closed_category = undefined
    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Closed ticket category reseted successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}