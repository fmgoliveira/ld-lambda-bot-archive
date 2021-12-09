const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")
const Topgg = require("@top-gg/sdk")
const topgg = new Topgg.Api(process.env.TOPGG_TOKEN)

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "vote",
            description: "Check if you have already voted. Get all the links to upvote the bot.",
            category: "general"
        })
    }

    run = async (message) => {
        let votedTopgg = await topgg.hasVoted(message.member.id)

        const embed = new MessageEmbed()
            .setTitle("Vote")
            .setDescription(`Upvote our bot to let us grow over Discord!`)
            .addField("[Top.gg](https://top.gg/bot/900398063607242762)", )
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