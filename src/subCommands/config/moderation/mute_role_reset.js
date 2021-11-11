const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    if (!interaction.guild.db.moderation.mute_role) return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("There isn't any mute role set yet.\n\n> You can set it with `/config moderation mute_role <role>`")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    interaction.guild.db.moderation.mute_role = undefined
    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Mute role reseted successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}