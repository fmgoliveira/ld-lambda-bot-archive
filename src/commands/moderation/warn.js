const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "warn",
            description: "Warn an user.",
            category: "moderation",
            usage: "<user> <reason>",
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to warn.",
                    required: true
                },
                {
                    name: "reason",
                    type: "STRING",
                    description: "The reason why you want to warn the user.",
                    required: true
                }
            ],
            requireDatabase: true,
            permissions: [ "MODERATE_MEMBERS" ]
        })
    }

    run = async (message) => {
        const user = message.options.getUser("user")
        const reason = message.options.getString("reason")

        const database = this.client.db.warns

        const warning = {
            moderator: message.member.user.tag,
            timestamp: new Date().getTime(),
            reason
        }

        await database.findOneAndUpdate({
            guildId: message.guild.id,
            userId: user.id
        }, {
            guildId: message.guild.id,
            userId: user.id,
            $push: {
                warnings: warning
            }
        }, {
            upsert: true
        })

        try {
            user.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Warned")
                        .setColor("RED")
                        .setDescription(`You have been warned in **${message.guild.name}**.`)
                        .addField("Reason", reason)
                        .addField("Moderator", message.member.user.tag)
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ]
            })
        } catch {
            console.log("Could not send message to user.")
        }

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`<@${user.id}> was warned | ${reason}`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

    }
}