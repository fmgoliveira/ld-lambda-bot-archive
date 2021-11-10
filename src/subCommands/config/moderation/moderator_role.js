const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    const role = interaction.options.getRole("moderator_role")

    if (role.toString() === "@everyone") return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("The `@everyone` role is not a role that could be assigned to a member.\n**Please choose a valid role.**")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    if (interaction.guild.db.moderation) interaction.guild.db.moderation.moderator_role = role.id
    else interaction.guild.db.moderation = { moderator_role: role.id }

    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Moderator role set successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}