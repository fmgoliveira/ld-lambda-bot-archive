const { CommandInteraction, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "buglist",
    description: "List all the bugs reported.",
    category: "bugs",
    options: [
        {
            name: "user",
            description: "The user who reported the bugs you want to list.",
            type: "USER",
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

        if (user) {
            let db = await client.db.bugs.find({ user: user.tag })
            if (db.length === 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Bug reports List")
                        .setDescription("This user has never reported a bug.")
                        .setColor(client.color)
                        .setTimestamp()
                        .setFooter(client.footer)
                ],
                ephemeral: true,
            })

            const embed = new MessageEmbed()
                .setTitle("Bug Reports List")
                .setDescription(`Here are all the bugs reported by **${user.tag}**. Use \`/buginfo <bug_id>\` to check more information about a specific bug report.`)
                .setColor(client.color)
                .setTimestamp()
                .setFooter(client.footer)

            if (db.length > 10) {
                db = db.slice(0, 25)
                embed.setDescription(`Here are the first ten bugs reported by **${user.tag}**. Use \`/buginfo <bug_id>\` to check more information about a specific bug report.`)
            }

            db.forEach(bug => {
                embed.addField(`ID: ${String(bug._id)}`, `**Content:** ${bug.content}` || "No description provided")
            })

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
        } else {
            let db = await client.db.bugs.find({})
            if (db.length === 0) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Bug reports List")
                        .setDescription("There aren't any bug reports currently.")
                        .setColor(client.color)
                        .setTimestamp()
                        .setFooter(client.footer)
                ],
                ephemeral: true,
            })

            const embed = new MessageEmbed()
                .setTitle("Bug Reports List")
                .setDescription(`Here are all the bugs reported. Use \`/buginfo <bug_id>\` to check more information about a specific bug report.`)
                .setColor(client.color)
                .setTimestamp()
                .setFooter(client.footer)

            if (db.length > 10) {
                db = db.slice(0, 25)
                embed.setDescription(`Here are the first ten bugs reported. Use \`/buginfo <bug_id>\` to check more information about a specific bug report.`)
            }

            db.forEach(bug => {
                embed.addField(`ID: ${String(bug._id)}`, `**Content:** ${bug.content}` || "No description provided")
            })

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
        }
    }
}