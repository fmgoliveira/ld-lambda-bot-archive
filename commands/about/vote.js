const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "vote",
    description: "Support us by upvoting our bot.",
    category: "about",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const userDb = await client.db.users.findOne({ userId: interaction.member.id })

        const getVoteStatus = (userDb) => {
            if (!userDb) return status = "You haven't voted me."
            let status = ""
            const voted = userDb.voted
            const amount = userDb.amount

            if (!voted || amount === 0) status = "You haven't voted me."
            if (amount === 1) status = "You have voted me **once**."
            if (amount === 2) status = "You have voted me **twice**."
            if (amount === 3) status = "You have voted me **three times**."
            if (amount === 4) status = "You have voted me **four times**."

            return status
        }

        const embed = new MessageEmbed()
            .setTitle("Upvote Bot")
            .setDescription(`By upvoting me, you are helping the Team (a lot) and it's completely free! Each time you vote for me on the sites below, I get more users.`)
            .addField("Why should you upvote Lambda Bot?", `First of all, it's free and doesn't take a lot of time. \nSecondly, you get the following **benefits**:\n\n• Voters role in Lambda Development Discord Server\n• Cool voters badge in the \`/whois\` command and \`User Info\` context command\n• Your name listed on \`#voting\` channel in Lambda Development Discord Server\n• Access to premium-only commands\n• Bonus entry in all giveaways managed by this bot\n\n_ _`)
            .addField("What is a vote streak?", "A vote streak is __the amount of votes you have in a certain moment__ (you can have up to 4 votes simultaneously by voting in all the links below)\n\n_ _")
            .addField("What are the voters roles and badges available?", `• **1** single vote: <:voted:937668445640724480> @Voted\n• **2** votes streak: <:double_voted:937668445695266867> @Double Voted\n• **3** votes streak: <:triple_voted:937668445728800808> @Triple Voted\n• **4** votes streak: <:dominating_votes:937668445686878208> @Dominating Votes\n\n_ _`)
            .addField("Where can I upvote the bot?", `You can upvote the bot in any of the links listed below:\n\n:link: [Top.gg](https://top.gg/bot/900398063607242762/vote)\n:link: [Scarps Bot List](https://botlist.scarps.club/bots/like/900398063607242762)\n:link: [Discord Labs](https://bots.discordlabs.org/bot/900398063607242762?vote)\n:link: [Bots for Discord](https://discords.com/bots/bot/900398063607242762/vote)\n\n_ _`)
            .addField("Your current status", getVoteStatus(userDb))
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter(client.footer)
            .setColor(client.color)

        return interaction.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setEmoji("<:voted:937668445640724480>").setLabel("Top.gg").setStyle("LINK").setURL("https://top.gg/bot/900398063607242762/vote"),
                    new MessageButton().setEmoji("<:double_voted:937668445695266867>").setLabel("Scarps Bot List").setStyle("LINK").setURL("https://botlist.scarps.club/bots/like/900398063607242762"),
                    new MessageButton().setEmoji("<:triple_voted:937668445728800808>").setLabel("Discord Labs").setStyle("LINK").setURL("https://bots.discordlabs.org/bot/900398063607242762?vote"),
                    new MessageButton().setEmoji("<:dominating_votes:937668445686878208>").setLabel("Bots for Discord").setStyle("LINK").setURL("https://discords.com/bots/bot/900398063607242762/vote"),
                )
            ]
        })
    }
}