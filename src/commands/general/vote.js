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
        let voted = await topgg.hasVoted(message.member.id)

        const checkVoted = (voted) => {
            if (voted) return "❌ Not active. Vote me to activate them"
            else return "✅ Active"
        }

        const embed = new MessageEmbed()
            .setTitle("Vote")
            .setDescription(`Upvote our bot to let us grow over Discord!`)
            .addField("Vote benefits", checkVoted(voted))
            .setThumbnail(this.client.user.avatarURL())
            .setTimestamp()
            .setFooter(this.client.user.username, this.client.user.avatarURL())

        return message.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setEmoji("👍").setLabel("Upvote Bot").setStyle("LINK").setURL("https://top.gg/bot/900398063607242762")
                )
            ]
        })
    }
}