const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "clearwarns",
            description: "Clears all the warns from an user.",
            category: "moderation",
            usage: "<user>",
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to remove the warnings.",
                    required: true
                }
            ],
            requireDatabase: true,
            permissions: [ "MODERATE_MEMBERS" ]
        })
    }

    run = async (message) => {
        let roleId

        const user = message.options.getUser("user")

        const database = this.client.db.warns

        const results = await database.findOne({
            guildId: message.guild.id,
            userId: user.id
        })

        if (!results?.warnings || !results || !results?.warnings?.length === 0) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Error`)
                    .setDescription(`<@${user.id}> has no warnings.`)
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

        results.remove()

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`All the warnings from <@${user.id}> were removed.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

    }
}