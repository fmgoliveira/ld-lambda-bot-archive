const { MessageEmbed, Guild, Client, WebhookClient } = require("discord.js")

module.exports = {
    name: "guildDelete",
    /**
     * 
     * @param {Guild} guild 
     * @param {Client} client 
     */
    async execute(guild, client) {
        if (!guild?.available) return
        const logWebhooks = new WebhookClient({
            id: process.env.BOT_LOGS_WEBHOOK_ID,
            token: process.env.BOT_LOGS_WEBHOOK_TOKEN,
            url: process.env.BOT_LOGS_WEBHOOK_URL,
        })
        try {
            logWebhooks.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Left a Guild")
                        .setDescription(`Bot left a guild.`)
                        .addField("Name", guild.name)
                        .addField("ID", guild.id, true)
                        .addField("Owner ID", guild.ownerId, true)
                        .addField("Premium Tier (Nitro boosts)", `\`${guild.premiumTier}\``)
                        .addField("Members", `${guild.members.cache.size}`, true)
                        .addField("Channels", `${guild.channels.cache.size}`, true)
                        .addField("Roles", `${guild.roles.cache.size}`, true)
                        .setThumbnail(guild.iconURL())
                        .setTimestamp()
                        .setColor("RED")
                ]
            }).catch(err => console.log(err))
        } catch (err) {
            console.log(err)
        }
        client.updateStatus(client)
    }
}