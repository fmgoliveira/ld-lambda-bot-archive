const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "warnings",
            description: "Show all user warnings.",
            category: "moderation",
            usage: "<user>",
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user whose warnings you want to get.",
                    required: true
                }
            ]
        })
    }

    run = async (message) => {
        const user = message.options.getUser("user")
        
        const database = this.client.db.warns

        const results = await database.findOne({
            guildId: message.guild.id,
            userId: user.id
        })

        const embed = new MessageEmbed()
            .setTitle(`Warnings of ${user.username}`)
            .setDescription("Here are all the warnings this user have:")
            .setFooter(this.client.user.username, this.client.user.avatarURL())
            .setTimestamp()
            .setColor("#ffa726")

        let counter = 1

        if (!results?.warnings || !results || !results?.warnings?.length === 0) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Warnings of ${user.username}`)
                    .setDescription(`<@${user.id}> has no warnings.`)
                    .setColor("#ffa726")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

        for (const warning of results.warnings) {
            const {moderator, timestamp, reason} = warning

            embed.addField(
                `Warning #${counter}`,
                `**Moderator:** ${moderator}\n**Date:** ${new Date(timestamp).toLocaleDateString()}\n**Reason:** ${reason}`,
                true 
            )

            counter++
        }

        return message.reply({
            embeds: [ embed ]
        })

    }
}