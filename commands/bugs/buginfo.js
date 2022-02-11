const { CommandInteraction, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "buginfo",
    description: "Show information about a bug.",
    category: "bugs",
    options: [
        {
            name: "bug_id",
            description: "The id of the bug you want to find.",
            type: "STRING",
            required: true
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const bugId = interaction.options.getString("bug_id")
        const db = await client.db.bugs.findOne({ _id: bugId })

        if (!db) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("Could not find a bug report with that ID. \n**Please inform a valid one**.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.footer)
            ],
            ephemeral: true,
        })

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Bug Report`)
                    .addField("ID", String(db._id), true)
                    .addField("Description", db.content)
                    .addField("Status", db.status, true)
                    .setTimestamp()
                    .setColor(client.color)
                    .setFooter(client.footer)
            ],
            ephemeral: true
        })
    }
}