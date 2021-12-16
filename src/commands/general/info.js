const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "info",
            description: "Show information about the bot.",
            category: "general"
        })
    }

    run = (message) => {
        const embed = new MessageEmbed()
            .setTitle("Bot Information")
            .setDescription(`Developed by <:logo:921033010764218428> **Lambda Development** Group`)
            .addField("Version", `\`${process.env.BOT_VERSION}\``)
            .addField("Creator", "<@549619189271494676> (`@DrMonocle#4948`)")
            .setThumbnail(this.client.user.avatarURL())
            .setTimestamp()
            .setFooter("Requested by: " + message.member.user.username, this.client.user.avatarURL())

        return message.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setEmoji("<:logo:921033010764218428>").setLabel("Join Lambda Development").setStyle("LINK").setURL(process.env.SERVER_LINK)
                )
            ]
        })
    }
}