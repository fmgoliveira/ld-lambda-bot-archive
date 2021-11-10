const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "invite",
            description: "Invite the bot for your server.",
            category: "general"
        })
    }

    run = (message) => {
        const embed = new MessageEmbed()
            .setTitle(`Invite ${this.client.user.username}`)
            .setDescription(`Click **[here](https://dsc.gg/lambda-invite)** to invite Lambda!`)
            .setThumbnail(this.client.user.avatarURL())
            .setTimestamp()
            .setFooter("Requested by: " + message.member.user.username, this.client.user.avatarURL())

        return message.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setEmoji("<:logo:906086580354162698>").setLabel("Invite Lambda").setStyle("LINK").setURL("https://dsc.gg/lambda-invite")
                )
            ]
        })
    }
}