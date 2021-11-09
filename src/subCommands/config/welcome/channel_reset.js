const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    if (!interaction.guild.db.welcome.channel) return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("There isn't any welcome channel set yet.\n\n> You can set it with `/config welcome channel <channel>`")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    interaction.guild.db.welcome.channel = undefined
    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Welcome channel reseted successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}