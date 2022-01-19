const { MessageEmbed } = require("discord.js")

module.exports = async (client, interaction) => {
    const role = interaction.options.getRole("role")
    const user = interaction.options.getUser("user")

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

    try {
        if (interaction.guild.members.cache.get(user.id).roles.cache.has(role.id)) return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setDescription("The user already hs this role.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
            ],
            ephemeral: true
        })
        await interaction.guild.members.cache.get(user.id).roles.add(role)
    } catch (err) { 
        if (err.message === "Missing Permissions") return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setDescription("I don't have permission to add that role to that user.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
            ],
            ephemeral: true
        })
        console.log(err)
    }

    return interaction.reply({
        embeds: [new MessageEmbed()
            .setTitle("Success")
            .setDescription("Role added successfully to user.")
            .setColor("#fff59d")
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
        ]
    })
}