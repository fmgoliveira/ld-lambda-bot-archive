const Event = require("../../structures/Event")
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "guildCreate"
        })
    }

    run = async (guild) => {
        try {
            this.client.channels.cache.get(process.env.LAMBDA_GUILD_LOGS).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Joined a Guild")
                        .setDescription(`Bot joined a guild.`)
                        .addField("Name", guild.name)
                        .addField("ID", guild.id, true)
                        .addField("Owner ID", guild.ownerId, true)
                        .addField("Premium Tier (Nitro boosts)", `\`${guild.premiumTier}\``)
                        .addField("Members", guild.memberCount, true)
                        .addField("Channels", `${guild.channels.cache.size}`, true)
                        .addField("Roles", `${guild.roles.cache.size}`, true)
                        .setThumbnail(guild.iconURL())
                        .setTimestamp()
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setColor("GREEN")
                ],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setEmoji("🔗")
                            .setLabel("Join server")
                            .setStyle("LINK")
                            .setCustomId(`invite_${guild.id}`)
                    )
                ]
            })
        } catch (err) {
            console.log(err)
        }

        try {
            guild.members.cache.get(ownerId).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Thank you for inviting me!")
                        .setDescription("Thank you for inviting me. You can configure me in the [dashboard page](https://bot.lambdadev.xyz/dashboard). If you need help, contact the Team of [Lambda Development](https://lambdadev.xyz/discord)")
                        .setThumbnail(this.client.user.avatarURL())
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                ]
            }).catch(err => console.log(err))
        } catch (err) { console.log(err) }
    }
}