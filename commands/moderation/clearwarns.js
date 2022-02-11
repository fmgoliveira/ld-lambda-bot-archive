const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "clearwarns",
    description: "Clears all the warns from an user.",
    category: "moderation",
    options: [
        {
            name: "user",
            type: "USER",
            description: "The user you want to remove the warnings from.",
            required: true
        }
    ],
    userPermissions: ["MODERATE_MEMBERS"],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client  
     */
    async execute(interaction, client) {
        let roleId
        const user = interaction.options.getUser("user")

        const database = client.db.warns

        const results = await database.findOne({
            guildId: interaction.guild.id,
            userId: user.id
        })

        if (!results?.warnings || !results || !results?.warnings?.length === 0) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Error`)
                    .setDescription(`<@${user.id}> has no warnings.`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.footer)
            ],
            ephemeral: true
        })

        results.remove()

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`All the warnings from <@${user.id}> were removed.`)
                    .setColor(client.color)
                    .setFooter(client.footer)
                    .setTimestamp()
            ],
            ephemeral: true
        })

    }
}