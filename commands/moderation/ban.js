const { CommandInteraction, Client, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")

module.exports = {
    name: "ban",
    description: "Bans a user from the server.",
    category: "moderation",
    botPermissions: ["BAN_MEMBERS"],
    userPermissions: ["BAN_MEMBERS"],
    options: [
        {
            name: "user",
            type: "USER",
            description: "The user you want to ban from the server.",
            required: true
        },
        {
            name: "reason",
            type: "STRING",
            description: "The reason why you want to ban the user from the server.",
            required: false
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const user = interaction.options.getUser("user")
        const reason = interaction.options.getString("reason") || "No reason provided."
        const member = interaction.guild.members.cache.get(user.id)
        const db = interaction.guild.db

        if (interaction.user.id === user.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't ban yourself. If you want, just leave the server by yourself.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.footer)
            ], ephemeral: true
        })

        if (interaction.guild.me.roles.highest.position <= member.roles.highest.position || interaction.guild.ownerId === member.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("I can't ban this user, one of his roles is above my highest one.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.footer)
            ], ephemeral: true
        })

        interaction.guild.members.ban(user, { reason }).then(() => {
            if (db.moderation.db.ban) {
                try {
                    user.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`Banned`)
                                .setColor("RED")
                                .setDescription(`You were banned from **${interaction.guild.name}**.`)
                                .addField("Reason", reason)
                                .addField("Moderator", interaction.member.user.tag)
                                .setFooter(client.footer)
                                .setTimestamp()
                        ]
                    })
                } catch {
                    console.log("Could not send message to user.")
                }
            }

            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`User \`${user.tag}\` banned successfully. ${db.moderation.includeReason ? "| " + reason : ""}`)
                        .setColor(client.footer)
                ]
            })
        }).catch(() => {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Error")
                        .setDescription("*An unknown error occurred while trying to run that command.*\nThis incident has been reported to the Team.")
                        .setFooter(client.footer)
                ],
                ephemeral: true,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setLabel("Support Server")
                            .setURL(process.env.LAMBDA_GUILD_LINK)
                            .setStyle("LINK")
                    )
                ]
            })
        })
    }
}