const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "support",
            description: "Join Lambda support server.",
            category: "general"
        })
    }

    run = (message) => {
        const embed = new MessageEmbed()
            .setTitle(`Need help?`)
            .setDescription(`Click **[here](https://dsc.gg/lambda-dev)** to join <:logo:906086580354162698> **Lambda Group**!`)
            .setThumbnail(this.client.user.avatarURL())
            .setTimestamp()
            .setFooter("Requested by: " + message.member.user.username, this.client.user.avatarURL())

        return message.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setEmoji("<:logo:906086580354162698>").setLabel("Support Server").setStyle("LINK").setURL("https://dsc.gg/lambda-dev")
                )
            ]
        })
    }
}