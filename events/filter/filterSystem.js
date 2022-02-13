const { Message, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {Message} message 
     * @param {Client} client 
     */
    async execute(message, client) {
        if (message.author.bot) return
        const { content, guild, author, channel } = message
        const db = await client.db.guilds.findOne({ guildId: guild.id }) || await client.db.guilds.create({ guildId: guild.id })

        if (!db.filter.active) return
        const filter = db.filter.words
        const logChannel = db.filter.logChannel

        const messageContent = content.toLowerCase().split(" ")

        if (filter.length <= 0) return

        const wordsUsed = []
        let shouldDelete = false

        messageContent.forEach(word => {
            if (filter.includes(word)) {
                wordsUsed.push(word),
                    shouldDelete = true
            }
        })

        if (shouldDelete) message.delete.catch(() => { })

        if (logChannel && wordsUsed.length) {
            const channelObj = client.channels.cache.get(logChannel)
            if (!channelObj) return

            channelObj.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Chat Filter System")
                        .setColor("RED")
                        .setAuthor({
                            name: author.tag,
                            iconURL: author.displayAvatarURL({ dynamic: true })
                        })
                        .setDescription([
                            `<@${author.id}> (\`${author.tag}\`) used ${wordsUsed.length} blacklisted word(s) in ${channel}.`,
                            `**Used words:**`,
                            `\`\`\``,
                            `${wordsUsed.map(w => w)}`,
                            `\`\`\``
                        ].join("\n").split(0, 4096))
                ]
            }).catch(() => { })
        }
    }
}