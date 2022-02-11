const { Message, MessageEmbed, Client } = require("discord.js")

module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {Message} message 
     * @param {Client} client 
     */
    async execute(message, client) {
        if (message.author.bot) return
        const db = client.db.afkSystem

        await db.deleteOne({ guildId: message.guild.id, userId: message.author.id })

        if (message.mentions.members.size) {
            const embed = new MessageEmbed()
                .setColor(client.color)
            message.mentions.members.forEach(m => {
                db.findOne({ guildId: message.guild.id, userId: m.id }, async (err, data) => {
                    if (err) throw err
                    if (data) {
                        embed.setDescription(`${m} went AFK <t:${data.time}:R>: \`${data.status}\`.`)
                        try {
                            return message.reply({ embeds: [embed] })
                        } catch (e) {
                            console.log(e)
                        }
                    }
                })
            })
        }
    }
}