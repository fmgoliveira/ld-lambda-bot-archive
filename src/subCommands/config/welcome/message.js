const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    const message = interaction.options.getString("message")

    if (interaction.guild.db.welcome) interaction.guild.db.welcome.message = message
    else interaction.guild.db.welcome = { message: message }

    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Welcome message set successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}