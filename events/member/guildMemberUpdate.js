const { MessageEmbed, GuildMember, Client } = require("discord.js")

module.exports = {
    name: "guildMemberUpdate",
    /**
     * 
     * @param {GuildMember} oldMember 
     * @param {GuildMember} newMember 
     */
    async execute(oldMember, newMember, client) {
        const settings = await client.db.guilds.findOne({ guildId: newMember.guild.id }) || new client.db.guilds({ guildId: newMember.guild.id })
        const logging = settings.logging
        if (!logging.channel.memberEvents) return

        if (oldMember.roles.cache !== newMember.roles.cache) {
            let addedRoles = []
            let removedRoles = []
            oldMember.roles.cache.forEach(role => {
                if (!newMember.roles.cache.has(role.id)) {
                    removedRoles.push(role)
                }
            })
            newMember.roles.cache.forEach(role => {
                if (!oldMember.roles.cache.has(role.id)) {
                    addedRoles.push(role)
                }
            })
            if (logging.active.memberEvents.rolesUpdate) {
                try {
                    newMember.guild.channels.cache.get(logging.channel.memberEvents).send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Member updated")
                                .setDescription(`The roles of ${newMember.user.tag} were updated.`)
                                .addField("Roles changed", `${addedRoles.length > 0 ? "Added: `" + addedRoles.join(", ") + "`\n" : "\n"} ${removedRoles.length > 0 ? "Removed: `" + removedRoles.join(", ") + "`" : ""}`)
                                .setTimestamp()
                                .setColor(logging.color.memberEvents)
                        ]
                    })
                } catch (err) {
                    console.log(err)
                }
            }
        }

        if (oldMember.nickname !== newMember.nickname) {
            if (logging.active.memberEvents.nicknameUpdate) {
                try {
                    newMember.guild.channels.cache.get(logging.channel.memberEvents).send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Member updated")
                                .setDescription(`The nickname of ${newMember.user.tag} was updated.`)
                                .addField("Old nickname", oldMember.nickname || oldMember.user.username)
                                .addField("New nickname", newMember.nickname || newMember.user.username)
                                .setTimestamp()
                                .setColor(logging.color.memberEvents)
                        ]
                    })
                } catch (err) {
                    console.log(err)
                }
            }
        }
    }
}