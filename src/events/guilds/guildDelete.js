const Event = require("../../structures/Event")
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "guildDelete"
        })
    }

    run = async (guild) => {
        try {
            this.client.channels.cache.get(process.env.LAMBDA_GUILD_LOGS).send({
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
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setColor("RED")
                ]
            }).catch(err => console.log(err))
        } catch (err) {
            console.log(err)
        }
    }
}