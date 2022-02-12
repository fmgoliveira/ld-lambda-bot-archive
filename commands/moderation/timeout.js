const { CommandInteraction, Client, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")
const ms = require("ms")

module.exports = {
    name: "timeout",
    description: "Timeout a user.",
    category: "moderation",
    botPermissions: ["MODERATE_MEMBERS"],
    userPermissions: ["MODERATE_MEMBERS"],
    options: [
        {
            name: "user",
            type: "USER",
            description: "The user you want to timeout.",
            required: true
        },
        {
            name: "duration",
            type: "STRING",
            description: "How long do you want to timeout the user (use \"off\" to disable).",
            required: true
        },
        {
            name: "reason",
            type: "STRING",
            description: "The reason why you want to timeout the user.",
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
        const duration = interaction.options.getString("duration")
        const reason = interaction.options.getString("reason") || "No reason provided."
        const member = interaction.guild.members.cache.get(user.id)
        const db = interaction.guild.db

        const timeInMs = ms(duration)

        if (interaction.user.id === user.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't timeout yourself.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.footer)
            ], ephemeral: true
        })

        if (interaction.guild.me.roles.highest.position <= member.roles.highest.position || interaction.guild.ownerId === member.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("I can't kick this user, one of his roles is above my highest one.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.footer)
            ], ephemeral: true
        })

        if (duration === "off") {
            member.timeout(null)

            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Timeout has been removed from <@${user.id}>.`)
                        .setColor(client.color)
                ]
            })
        }

        member.timeout(timeInMs, reason)

        if (interaction.guild.db.moderation.dm.timeout) {
            try {
                user.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Timed out")
                            .setColor("RED")
                            .setDescription(`You were timed out in **${interaction.guild.name}**.`)
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

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`<@${user.id}> has been timed out. ${message.guild.db.moderation.includeReason ? "| " + reason : ""}`)
                    .setColor(client.color)
            ]
        })
    }
}