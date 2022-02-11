const { MessageEmbed, Guild, Client, WebhookClient } = require("discord.js")

module.exports = {
    name: "guildUpdate",
    /**
     * 
     * @param {Guild} oldGuild 
     * @param {Guild} newGuild 
     * @param {Client} client 
     */
    async execute(oldGuild, newGuild, client) {
        if (!newGuild?.available) return
        if (newGuild === oldGuild) return
        const settings = await client.db.guilds.findOne({ guildId: newGuild.id }) || new client.db.guilds({ guildId: newGuild.id })
        const logging = settings.logging

        if (!logging.active.serverEvents.guildUpdate) return

        if (!logging.channel.serverEvents) return

        try {
            newGuild.guild.channels.cache.get(logging.channel.serverEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Guild updated")
                        .setDescription(`This server's configuration was updated.`)
                        .setTimestamp()
                        .setColor(logging.color.serverEvents)
                ]
            })
        } catch (err) {
            console.log(err)
        }
    }
}