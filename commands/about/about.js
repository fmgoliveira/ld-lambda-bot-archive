const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "about",
    description: "Show information about the bot.",
    category: "about",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const embed = new MessageEmbed()
            .setTitle("About Lambda")
            .setDescription(`Developed by <:logo:921033010764218428> **Lambda Development** Group`)
            .addField("Version", `\`${process.env.BOT_VERSION}\``)
            .addField("Creator", "<@549619189271494676> (`@DrMonocle#4948`)")
            .addField("Links", `[Invite](https://bot.lambdadev.xyz/invite)\n[Support](https://bot.lambdadev.xyz/support)\n[Wiki](https://wiki.lambdadev.xyz/bot)\n[Dashboard](https://bot.lambdadev.xyz/dashboard)\n[Upvote](https://discord.com/channels/878935240377241701/936677696300253204/937720075320979516)`)
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter(client.footer)
            .setColor(client.color)

        const components = [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("🤖")
                    .setLabel("Invite Bot")
                    .setStyle("LINK")
                    .setURL(`https://bot.lambdadev.xyz/invite`),
                new MessageButton()
                    .setEmoji("❓")
                    .setLabel("Support Server")
                    .setStyle("LINK")
                    .setURL(process.env.LAMBDA_GUILD_LINK),
                new MessageButton()
                    .setLabel("Website/Dashboard")
                    .setEmoji("🌐")
                    .setStyle("LINK")
                    .setURL(`https://bot.lambdadev.xyz/`),
            )
        ]

        interaction.reply({
            embeds: [embed],
            components
        })
    }
}