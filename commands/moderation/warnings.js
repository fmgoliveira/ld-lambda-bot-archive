const { CommandInteraction, Client, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")

module.exports = {
    name: "warnings",
    description: "List all user's warnings.",
    category: "moderation",
    userPermissions: ["MODERATE_MEMBERS"],
    options: [
        {
            name: "user",
            type: "USER",
            description: "The user whose warnings you want to get.",
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
        const warnDb = client.db.warns

        const results = await warnDb.findOne({ guildId: interaction.guild.id, userId: user.id })

        const embed = new MessageEmbed()
            .setTitle(`Warnings of ${user.username}`)
            .setDescription("Here are the first 25 warnings this user have:")
            .setFooter(client.footer)
            .setTimestamp()
            .setColor(client.color)

        let counter = 1

        if (!results?.warnings || !results || !results?.warnings?.length === 0) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Warnings of ${user.username}`)
                    .setDescription(`<@${user.id}> has no warnings.`)
                    .setFooter(client.footer)
                    .setTimestamp()
                    .setColor(client.color)
            ]
        })

        for (const warning of results.warnings.slice(0, 25)) {
            const { moderator, timestamp, reason } = warning

            embed.addField(
                `Warning #${counter}`,
                `**Moderator:** ${moderator}\n**Time:** <t:${parseInt(timestamp / 1000)}:R>\n**Reason:** ${reason}`,
                true
            )

            counter++
        }

        return interaction.reply({
            embeds: [embed],
            ephemeral: false
        })
    }
}