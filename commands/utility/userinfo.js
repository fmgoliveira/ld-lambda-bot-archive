const { MessageEmbed, ContextMenuInteraction, Client } = require("discord.js")

module.exports = {
    name: "User Info",
    type: "USER",
    context: true,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const target = await interaction.guild.members.fetch(interaction.targetId)

        const { id, bot, username, discriminator, } = target.user
        const avatar = target.user.avatarURL({ dynamic: true, size: 512 })
        let staff = false
        let dev = false
        let owner = false
        let voted1 = false
        let voted2 = false
        let voted3 = false
        let voted4 = false
        let booster = false
        let roles = ""
        let statusStr
        let status
        let footer = client.user.username
        let roleCount = 0

        try {
            statusStr = interaction.guild.members.cache.get(id).presence.status
        } catch {
            statusStr = "offline"
        }

        if (statusStr === "online") status = "<:status_green:906087473627668490> Online"
        if (statusStr === "dnd") status = "<:status_red:906087602447335424> Do not disturb"
        if (statusStr === "idle") status = "<:status_yellow:906087532356304906> Idle"
        if (statusStr === "offline") status = "<:status_grey:916358227027980328> Offline"

        interaction.guild.members.cache.get(id).roles.cache.forEach(role => {
            if (role.id !== interaction.guild.id) roles += `<@&${role.id}> `
            roleCount++
        })
        roleCount--

        if (roleCount === 0) roles = "The user has no roles in this server"

        if (client.mainGuild.members.cache.has(id)) {
            if (client.mainGuild.members.cache.get(id).roles.cache.has(process.env.STAFF_ROLE)) {
                staff = true
            }
            if (client.mainGuild.members.cache.get(id).roles.cache.has(process.env.DEV_ROLE)) {
                dev = true
            }
            if (client.mainGuild.members.cache.get(id).roles.cache.has(process.env.VOTED1_ROLE)) {
                voted1 = true
            }
            if (client.mainGuild.members.cache.get(id).roles.cache.has(process.env.VOTED2_ROLE)) {
                voted2 = true
            }
            if (client.mainGuild.members.cache.get(id).roles.cache.has(process.env.VOTED3_ROLE)) {
                voted3 = true
            }
            if (client.mainGuild.members.cache.get(id).roles.cache.has(process.env.VOTED4_ROLE)) {
                voted4 = true
            }
        }

        if (id === process.env.OWNER_ID) owner = true
        if (target.premiumSinceTimestamp) booster = true

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
        if (voted1) {
            if (acknowledgements === "") acknowledgements += "<:voted:937668445640724480> Voted"
            else acknowledgements += ", <:voted:937668445640724480> Voted"
        }
        if (voted2) {
            if (acknowledgements === "") acknowledgements += "<:double_voted:937668445695266867> Double Voted"
            else acknowledgements += ", <:double_voted:937668445695266867> Double Voted"
        }
        if (voted3) {
            if (acknowledgements === "") acknowledgements += "<:triple_voted:937668445728800808> Triple Voted"
            else acknowledgements += ", <:triple_voted:937668445728800808> Triple Voted"
        }
        if (voted4) {
            if (acknowledgements === "") acknowledgements += "<:dominating_votes:937668445686878208> Dominating Votes"
            else acknowledgements += ", <:dominating_votes:937668445686878208> Dominating Votes"
        }
        if (owner) {
            if (acknowledgements === "") acknowledgements += "Server Owner"
            else acknowledgements += ", Server Owner"
        }
        if (booster) {
            if (acknowledgements === "") acknowledgements += "Server Booster"
            else acknowledgements += ", Server Booster"
        }

        const embed = new MessageEmbed()
            .setDescription(`<@${id}>`)
            .setAuthor({ name: `${username}#${discriminator}`, iconURL: avatar })
            .setThumbnail(avatar)
            .addField(`Joined`, `<t:${parseInt(target.joinedTimestamp / 1000)}:R>`, true)
            .addField(`Registered`, `<t:${parseInt(target.user.createdTimestamp / 1000)}:R>`, true)
            .addField(`Roles [${roleCount}]`, roles)
            .addField("ID", id)
            .addField("Bot", bot ? `✅ Yes` : `❌ No`, true)
            .addField("Status", status, true)
            .addField("Acknowledgements", acknowledgements === "" ? "None" : acknowledgements)
            .setFooter({ text: footer, iconURL: client.user.avatarURL() })
            .setColor("#ffa726")
            .setTimestamp()

        if (staff) embed.setDescription(`<:logo:921033010764218428> <@${id}>`)

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}