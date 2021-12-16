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
        let dev = false
        let owner = false
        let voted = false
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

        if (this.client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).members.cache.has(id)) {
            if (this.client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).members.cache.get(id).roles.cache.has(process.env.STAFF_ROLE)) {
                staff = true
            }
            if (this.client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).members.cache.get(id).roles.cache.has(process.env.DEV_ROLE)) {
                dev = true
            }
            if (this.client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).members.cache.get(id).roles.cache.has(process.env.VOTED_ROLE)) {
                voted = true
            }
        }

        if (id === process.env.OWNER_ID) owner = true

        let acknowledgements = ""

        if (staff) {
            if (acknowledgements === "") acknowledgements += "<:mod:919935193857548308> Lambda Team"
            else acknowledgements += ", <:mod:919935193857548308> Lambda Team"
        }
        if (dev) {
            if (acknowledgements === "") acknowledgements += "<:dev:919935194000154624> Lambda Developer"
            else acknowledgements += ", <:dev:919935194000154624> Lambda Developer"
        }
        if (owner) {
            if (acknowledgements === "") acknowledgements += "<:owner:919935193861718036> Bot Owner"
            else acknowledgements += ", <:owner:919935193861718036> Bot Owner"
        }
        if (voted) {
            if (acknowledgements === "") acknowledgements += "<:voted:919935193832362044> Voted"
            else acknowledgements += ", <:voted:919935193832362044> Voted"
        }
        if (message.guild.ownerId === id) {
            if (acknowledgements === "") acknowledgements += "Server Owner"
            else acknowledgements += ", Server Owner"
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
            .addField("Acknowledgements", acknowledgements === "" ? "None" : acknowledgements)
            .setFooter(footer, this.client.user.avatarURL())
            .setColor("#ffa726")

        if (staff) embed.setDescription(`<:logo:921033010764218428> <@${id}>`)
        else embed.setTimestamp()

        message.reply({
            embeds: [embed]
        })
    }
}