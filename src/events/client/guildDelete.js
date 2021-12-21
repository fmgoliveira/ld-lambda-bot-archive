const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "guildDelete"
        })
    }

    run = async (guild) => {
        console.log("Bot left ", guild.name)
        if (!guild.available) return
        this.client.updateStatus()
        // this.client.startWebServer()
        this.client.channels.cache.get(process.env.LAMBDA_GUILD_LOGS).send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Left")
                    .setDescription("Bot left a guild!")
                    .addField("Name", guild.name, true)
                    .addField("ID", guild.id, true)
                    .addField("Owner ID", guild.ownerId, true)
                    .setTimestamp()
                    .setColor("RED")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })
    }
}