const { CommandInteraction, Client, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")

module.exports = {
    name: "warn",
    description: "Warn a user.",
    category: "moderation",
    userPermissions: ["MODERATE_MEMBERS"],
    options: [
        {
            name: "user",
            type: "USER",
            description: "The user you want to warn.",
            required: true
        },
        {
            name: "reason",
            type: "STRING",
            description: "The reason why you want to warn the user.",
            required: true
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
        const db = interaction.guild.db
        const warnDb = client.db.warns

        const warning = {
            moderator: interaction.user.tag,
            timestamp: Date.now(),
            reason
        }

        await warnDb.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: user.id
        }, {
            guildId: interaction.guild.id,
            userId: user.id,
            $push: {
                warnings: warning
            }
        }, {
            upsert: true
        })

        if (db.moderation.dm.warn) {
            try {
                user.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Warn")
                            .setColor("RED")
                            .setDescription(`You have been warned in **${interaction.guild.name}**.`)
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
                    .setDescription(`<@${user.id}> has been warned. ${interaction.guild.db.moderation.includeReason ? "| " + reason : ""}`)
                    .setColor(client.color)
            ]
        })
    }
}