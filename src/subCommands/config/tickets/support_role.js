const { MessageEmbed } = require("discord.js")

module.exports = (client, interaction) => {
    const role = interaction.options.getRole("support_role")

    if (role.toString() === "@everyone") return role.id = "everyone"

    if (interaction.guild.db.tickets) interaction.guild.db.tickets.support_role = role.id
    else interaction.guild.db.tickets = { support_role: role.id }

    interaction.guild.db.save()

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Ticket support role set successfully.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
    
}