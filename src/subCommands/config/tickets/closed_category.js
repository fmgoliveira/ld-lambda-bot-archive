const { MessageEmbed, Permissions } = require("discord.js")

module.exports = (client, interaction) => {
    const channel = interaction.options.getChannel("closed_category")

    if (channel.type !== "GUILD_CATEGORY") return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("Please inform a valid text/announcement channel.")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    if (!channel.permissionsFor(interaction.guild.members.resolve(client.user)).has(Permissions.FLAGS.MANAGE_CHANNELS)) return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("I don't have permission to manage channels in that category. __I won't be able to create ticket threads__.\n\n **Please make sure I have permission to create channels in that category**.")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    if (interaction.guild.db.tickets) interaction.guild.db.tickets.closed_category = channel.id
    else interaction.guild.db.tickets = { closed_category: channel.id }

    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Closed ticket category set successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}