const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Event = require("../../structures/Event")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "guildMemberAdd"
        })
    }

    run = async (member) => {
        const guildDB = await this.client.db.guilds.findById(member.guild.id)

        if (guildDB?.welcome?.channel) {
            const welcomeChannel = member.guild.channels.cache.get(guildDB.welcome.channel)
            let welcomeMessage

            if (guildDB.welcome.message) welcomeMessage = guildDB.welcome.message
                .replace("{username}", member.user.username)
                .replace("{usermention}", `<@${member.user.id}>`)
                .replace("{usertag}", member.user.tag)
                .replace("{userid}", member.user.id)
            else welcomeMessage = `***${member.toString()}***, welcome to **${member.guild.name}**! Have a great time here!`

            welcomeChannel?.send(welcomeMessage)
        }

        if (guildDB?.welcome?.role) {
            const role = member.guild.roles.cache.get(guildDB.welcome.role)

            if (role.rawPosition < member.guild.members.resolve(this.client.user).roles.highest.rawPosition) member.roles.add(guildDB.welcome.role)
        }
    }
}