const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    const role = interaction.options.getRole("mute_role")

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
    if (role.rawPosition > interaction.guild.members.resolve(client.user).roles.highest.rawPosition) return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("The role you have informed is above my highest role. __I won't be able to assign that role to muted members__.\n\n **Please make sure the role is below my highest role**.")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    if (interaction.guild.db.moderation) interaction.guild.db.moderation.mute_role = role.id
    else interaction.guild.db.moderation = { mute_role: role.id }

    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Mute role set successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}