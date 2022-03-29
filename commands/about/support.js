const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "support",
    description: "Join Lambda Development support server.",
    category: "about",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const embed = new MessageEmbed()
            .setTitle(`Need help?`)
            .setDescription(`Click **[here](process.env.LAMBDA_GUILD_LINK)** to join <:logo:921033010764218428> **Lambda Development Server**!`)
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter(client.footer)
            .setColor(client.color)

        return interaction.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setLabel("Support Server").setStyle("LINK").setURL(process.env.LAMBDA_GUILD_LINK)
                )
            ]
        })
    }
}
