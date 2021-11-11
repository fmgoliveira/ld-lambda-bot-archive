const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    if (!interaction.guild.db.moderation.moderator_role) return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("There isn't any moderator role set yet.\n\n> You can set it with `/config moderation moderator_role <role>`")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    interaction.guild.db.moderation.moderator_role = undefined
    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Moderator role reseted successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}