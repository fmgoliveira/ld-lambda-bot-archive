const { GuildChannel, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "channelDelete",
    /**
     * 
     * @param {GuildChannel} channel 
     * @param {Client} client 
     */
    async execute(channel, client) {
        const settings = await client.db.guilds.findOne({ guildId: channel.guild.id }) || new client.db.guilds({ guildId: channel.guild.id })
        const logging = settings.logging

        if (!logging.active.serverEvents.channelDelete) return

        if (!logging.channel.serverEvents) return

        try {
            channel.guild.channels.cache.get(logging.channel.serverEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Channel deleted")
                        .setDescription(`An existing channel was deleted.`)
                        .addField("Channel", `${channel.name}`, true)
                        .addField("Channel ID", `${channel.id}`, true)
                        .addField("Category", `${channel.parent.name}`, true)
                        .setTimestamp()
                        .setColor(logging.color.serverEvents)
                ]
            })
        } catch (err) {
            console.log(err)
        }
        client.updateStatus(client)
    }
}