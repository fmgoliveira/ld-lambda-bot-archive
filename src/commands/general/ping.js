const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "Show the bot ping.",
            category: "general"
        })
    }

    run = (message) => {
        var ping = 0
        if (Date.now() > message.createdTimestamp) {
            ping = Date.now() - message.createdTimestamp
        } else {
            ping = message.createdTimestamp - Date.now()
        }
        message.reply({
            embeds: [new MessageEmbed()
                .setTitle("🏓  Bot Ping")
                .setDescription(`🔸 Latency: \`${ping}ms\`\n🔸 Websocket: \`${this.client.ws.ping}ms\``)
                .setFooter("Requested by: " + message.member.user.username, this.client.user.avatarURL())
                .setTimestamp()
                .setColor("#ffa726")
            ]
        })
    }
}