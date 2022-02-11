const { CommandInteraction, MessageEmbed } = require("discord.js")

module.exports = {
    name: "afk",
    description: "AFK module commands.",
    options: [
        {
            name: "set",
            type: "SUB_COMMAND",
            description: "Set your AFK status.",
            options: [
                {
                    name: "status",
                    description: "Your AFK status.",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "return",
            type: "SUB_COMMAND",
            description: "Return from AFK status."
        }
    ],
    category: "utility",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const db = client.db.afkSystem
        const { guild, options, user, createdTimestamp } = interaction

        const embed = new MessageEmbed()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })

        const afkStatus = options.getString("status")

        try {
            switch (options.getSubcommand()) {
                case "set": {
                    await db.findOneAndUpdate({
                        guildId: guild.id,
                        userId: user.id
                    }, {
                        status: afkStatus,
                        time: parseInt(createdTimestamp / 1000)
                    }, {
                        new: true,
                        upsert: true
                    })

                    embed
                        .setColor(client.color)
                        .setDescription(`Your AFK status has been updated to \`${afkStatus}\` successfully.`)
                        .setTimestamp()
                        .setFooter(client.footer)
                        .setTitle("Success")

                    return interaction.reply({ embeds: [embed], ephemeral: true })
                }
                case "return": {
                    await db.deleteOne({
                        guildId: guild.id,
                        userId: user.id
                    })

                    embed
                        .setColor(client.color)
                        .setDescription(`Your AFK status has been removed successfully.`)
                        .setTimestamp()
                        .setFooter(client.footer)
                        .setTitle("Success")

                    return interaction.reply({ embeds: [embed], ephemeral: true })
                }
            }
        } catch (e) {
            console.log(e)
        }

    }
}