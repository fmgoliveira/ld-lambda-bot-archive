const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "serverinfo",
            description: "Show some info about the server.",
            category: "general"
        })
    }

    run = (message) => {
        const guild = message.guild

        const { id, name, members, channels, memberCount, ownerId, roles } = guild
        const icon = guild.iconURL()
        const owner = members.cache.get(ownerId)

        console.log(memberCount)

        const embed = new MessageEmbed()
            .setTitle(`${name}`)
            .setThumbnail(icon)
            .addField("ID", id, true)
            .addField("Member Count", String(memberCount), true)
            .addField("Channels", String(channels.cache.size), true)
            .addField("Owner", `${owner.user.tag} (\`${ownerId}\`)`, true)
            .addField("Roles", String(roles.cache.size), true)
            .setFooter(this.client.user.username, this.client.user.avatarURL())
        
        message.reply({
            embeds: [ embed ]
        })
    }
}