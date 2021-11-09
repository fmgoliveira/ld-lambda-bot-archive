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
            .setDescription(`Developed by <:logo:906086580354162698> **LΛMBDΛ Group**`)
            .addField("Version", `\`${process.env.BOT_VERSION}\``)
            .addField("Creator", "`@DrMonocle#4948`")
            .setThumbnail(this.client.user.avatarURL())
            .setTimestamp()
            .setFooter("Requested by: " + message.member.user.username, this.client.user.avatarURL())

        return message.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setEmoji("<:logo:906086580354162698>").setLabel("Join Lambda Group").setStyle("LINK").setURL(process.env.SERVER_LINK)
                )
            ]
        })
    }
}