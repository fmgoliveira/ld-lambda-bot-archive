const { CommandInteraction, Client, MessageEmbed } = require("discord.js")
const bugButtons = require("../../utils/components/bugButtons")

module.exports = {
    name: "bugreport",
    description: "Report a bug.",
    category: "bugs",
    options: [
        {
            name: "description",
            description: "Describe the bug you found.",
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
        const bugMessage = interaction.options.getString("description")

        const lambdaGuild = client.staffGuild
        const channel = client.staffGuild.channels.cache.get(process.env.BUGS_CHANNEL_ID)
        const user = interaction.member.user.tag
        const guild = `${interaction.guild.name} (\`${interaction.guildId}\`)`

        const db = await client.db.bugs.create({
            content: bugMessage,
            user,
            guild,
            status: "Reported"
        })

        channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Bug Report`)
                    .addField("ID", String(db._id))
                    .addField("Description", db.content)
                    .addField("Reported by", db.user, true)
                    .addField("Guild", db.guild, true)
                    .addField("Status", db.status, true)
                    .setTimestamp()
                    .setColor(client.color)
                    .setFooter(client.footer)
            ],
            components: bugButtons(),
            fetchReply: true
        })

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Success`)
                    .setDescription("Bug Report sent successfully!")
                    .addField("Report ID", String(db._id))
                    .addField("Message", db.content)
                    .setTimestamp()
                    .setColor(client.color)
                    .setFooter(client.footer)
            ],
            ephemeral: true
        })
    }
}