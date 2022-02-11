const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "invite",
    description: "Invite the bot for your server.",
    category: "about",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const embed = new MessageEmbed()
            .setTitle(`Invite ${client.user.username}`)
            .setDescription(`Click **[here](https://bot.lambdadev.xyz/invite)** to invite Lambda!`)
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter(client.footer)
            .setColor(client.color)

        return interaction.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setLabel("Invite Lambda").setStyle("LINK").setURL("https://bot.lambdadev.xyz/invite")
                )
            ]
        })
    }
}