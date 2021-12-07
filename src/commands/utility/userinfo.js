const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "userinfo",
            description: "Show some info about a user.",
            category: "utility",
            options: [
                {
                    type: "USER",
                    name: "user",
                    description: "The user you want to know more about",
                    required: true
                }
            ]
        })
    }

    run = (message) => {
        const user = message.options.getUser("user")

        const { id, bot, username, discriminator } = user
        const avatar = user.avatarURL()
        let staff = false
        let roles = ""
        let statusStr
        let status
        let footer = this.client.user.username
        let roleCount = 0

        try {
            statusStr = message.guild.members.cache.get(id).presence.status  
        } catch {
            statusStr = "offline"
        }

        if (statusStr === "online") status = "<:status_green:906087473627668490> Online"
        if (statusStr === "dnd") status = "<:status_red:906087602447335424> Do not disturb"
        if (statusStr === "idle") status = "<:status_yellow:906087532356304906> Idle"
        if (statusStr === "offline") status = "<:status_grey:916358227027980328> Offline"

        message.guild.members.cache.get(id).roles.cache.forEach(role => {
            if (role.id !== message.guild.id) roles += `<@&${role.id}> `
            roleCount++
        })
        roleCount--

        if (roleCount === 0) roles = "The user has no roles in this server"

        if (this.client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).members.cache.get(id).roles.cache.has(process.env.STAFF_ROLE)) {
            staff = true
            footer += " | The emoji next to the mention means the user is part of Lambda Staff Team"
        }

        const embed = new MessageEmbed()
            .setDescription(`<@${id}>`)
            .setAuthor(`${username}${discriminator}`, avatar)
            .setThumbnail(avatar)
            .addField(`Joined`, message.guild.members.cache.get(id).joinedAt.toLocaleString(), true)
            .addField(`Registered`, user.createdAt.toLocaleString(), true)
            .addField(`Roles [${roleCount}]`, roles)
            .addField("ID", id)
            .addField("Bot", bot ? `✅ Yes` : `❌ No`, true)
            .addField("Status", status, true)
            .setFooter(footer, this.client.user.avatarURL())
            .setColor("#ffa726")
        
        if (staff) embed.setDescription(`<:logo:906086580354162698> <@${id}>`)
        else embed.setTimestamp()
        
        message.reply({
            embeds: [ embed ]
        })
    }
}