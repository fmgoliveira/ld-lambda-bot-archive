const { Client, MessageEmbed, CommandInteraction } = require("discord.js")
const { connection } = require("mongoose")
require("../../events/client/ready")

module.exports = {
    name: "status",
    description: "Display the status of the client and database connection.",
    category: "about",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        var ping = 0
        if (Date.now() > interaction.createdTimestamp) {
            ping = Date.now() - interaction.createdTimestamp
        } else {
            ping = interaction.createdTimestamp - Date.now()
        }
        const response = new MessageEmbed()
            .setColor(client.color)
            .setTitle("Bot Status")
            .setTimestamp()
            .setThumbnail(client.user.avatarURL())
            .setFooter(client.footer)
            .addField(`Client`, `**Status:** <:status_green:906087473627668490> Online\n**Ping:** \`${ping}ms\`\n**Websocket:** \`${client.ws.ping}ms\`\n**Uptime:** <t:${parseInt(client.readyTimestamp / 1000)}:R>`)
            .addField(`Database`, `**Type:** MongoDB\n**Status:** ${switchToVal(connection.readyState)}`)

        interaction.reply({
            embeds: [response]
        })
    }
}

function switchToVal(val) {
    var status = " "
    switch (val) {
        case 0:
            status = `<:status_red:906087602447335424> Disconnected`
            break
        case 1:
            status = `<:status_green:906087473627668490> Connected`
            break
        case 2:
            status = `<:status_yellow:906087532356304906> Connecting`
            break
        case 3:
            status = `<:status_yellow:906087532356304906> Disconnecting`
            break
    }
    return status
}