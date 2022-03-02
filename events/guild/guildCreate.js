const { MessageEmbed, MessageActionRow, MessageButton, Guild, Client, WebhookClient } = require("discord.js")

module.exports = {
    name: "guildCreate",
    /**
     * 
     * @param {Guild} guild 
     * @param {Client} client 
     */
    async execute(guild, client) {
        if (!guild?.available) return

        if (!(await client.db.guilds.findOne({ guildId: guild.id }))) await client.db.guilds.create({ guildId: guild.id })

        const logWebhooks = new WebhookClient({
            id: process.env.BOT_LOGS_WEBHOOK_ID,
            token: process.env.BOT_LOGS_WEBHOOK_TOKEN,
            url: process.env.BOT_LOGS_WEBHOOK_URL,
        })
        try {
            logWebhooks.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Joined a Guild")
                        .setDescription(`Bot joined a guild.`)
                        .addField("Name", guild.name)
                        .addField("ID", guild.id, true)
                        .addField("Owner ID", guild.ownerId, true)
                        .addField("Premium Tier (Nitro boosts)", `\`${guild.premiumTier}\``)
                        .addField("Members", `${guild.members.cache.size}`, true)
                        .addField("Channels", `${guild.channels.cache.size}`, true)
                        .addField("Roles", `${guild.roles.cache.size}`, true)
                        .setThumbnail(guild.iconURL())
                        .setTimestamp()
                        .setColor("GREEN")
                ]
            }).catch(err => console.log(err))
        } catch (err) {
            console.log(err)
        }


        try {
            guild.members.cache.get(guild.ownerId).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Thank you for inviting me!")
                        .setDescription("Thank you for inviting me. You can configure me in the [dashboard page](https://bot.lambdadev.xyz/dashboard). If you need help, contact the Team of [Lambda Development](https://lambdadev.xyz/discord)")
                        .setThumbnail(client.user.avatarURL())
                        .setFooter(client.footer)
                        .setColor(client.color)
                ],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setEmoji("🌐")
                            .setLabel("Dashboard")
                            .setStyle("LINK")
                            .setURL("https://bot.lambdadev.xyz/dashboard"),
                        new MessageButton()
                            .setEmoji("<:logo:921033010764218428>")
                            .setLabel("Lambda Development")
                            .setStyle("LINK")
                            .setURL(process.env.LAMBDA_GUILD_LINK)
                    )
                ]
            }).catch(err => console.log(err))
        } catch (err) { console.log(err) }
    }
}