const { Role, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "roleDelete",
    /**
     * 
     * @param {Role} role 
     * @param {Client} client 
     */
    async execute(role, client) {
        const settings = await client.db.guilds.findOne({ guildId: role.guild.id }) || new client.db.guilds({ guildId: role.guild.id })
        const logging = settings.logging

        if (!logging.active.serverEvents.roleCreateDelete) return

        if (!logging.channel.serverEvents) return

        try {
            role.guild.channels.cache.get(logging.channel.serverEvents).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Role deleted")
                        .setDescription(`An existing role was deleted.`)
                        .addField("Role", `${role.name}`, true)
                        .addField("Role ID", `${role.id}`, true)
                        .setTimestamp()
                        .setColor(logging.color.serverEvents)
                ]
            })
        } catch (err) {
            console.log(err)
        }
    }
}