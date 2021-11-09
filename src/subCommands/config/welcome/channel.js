const { MessageEmbed, Permissions } = require("discord.js")

module.exports = (client, interaction) => {
    const channel = interaction.options.getChannel("channel")

    if (!channel.permissionsFor(interaction.guild.members.resolve(client.user)).has(Permissions.FLAGS.SEND_MESSAGES)) return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("I don't have permission to send messages in that channel. __I won't be able to send messages when a new user joins the server__.\n\n **Please make sure I have permission to write in that channel**.")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    if (channel.type !== "GUILD_TEXT") return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Error")
            .setDescription("Please inform a valid text/announcement channel.")
            .setColor("RED")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    if (interaction.guild.db.welcome) interaction.guild.db.welcome.channel = channel.id
    else interaction.guild.db.welcome = { channel: channel.id }

    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Welcome channel set successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}