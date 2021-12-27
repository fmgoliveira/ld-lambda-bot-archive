const { MessageEmbed, MessageActionRow, MessageButton, Message } = require("discord.js")
const Command = require("../../structures/Command")
const inviteButton = require("../../structures/components/inviteButton")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "buglist",
            description: "Show information about a bugthe list of all the bugs reported.",
            category: "bugs",
            options: [
                {
                    type: "USER",
                    name: "user",
                    description: "The user who reported the bugs you want to list.",
                    required: false
                }
            ]
        })
    }

    run = async (message) => {
        const user = message.options.getUser("user")

        if (user) {

            let db
            db = await this.client.db.bugs.find({ user: user.tag })
            
            if (db.length === 0) return message.reply({
                embeds: [new MessageEmbed()
                    .setTitle("Bug reports List")
                    .setDescription("This user has never reported a bug.")
                    .setColor("#E67E22")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                ]
            })

            const embed = new MessageEmbed()
                .setTitle("Bug Reports List")
                .setDescription(`Here are all the bugs reported by **${user.tag}**. Use \`/buginfo <bug_id>\` to check more information about a specific bug report.`)
                .setColor("#E67E22")
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.avatarURL())
            
                db.forEach(bug => {
                    embed.addField(`ID: ${String(bug._id)}`, `**Content:** ${bug.content}` || "No description provided")
                })

            return message.reply({
                embeds: [ embed ]
            })
        } else {
            let db
            db = await this.client.db.bugs.find({})

            if (db.length === 0) return message.reply({
                embeds: [new MessageEmbed()
                    .setTitle("Bug reports List")
                    .setDescription("There aren't any bugs reported.")
                    .setColor("#E67E22")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                ]
            })

            const embed = new MessageEmbed()
                .setTitle("Bug Reports List")
                .setDescription(`Here are all the bugs reported. Use \`/buginfo <bug_id>\` to check more information about a specific bug report.`)
                .setColor("#E67E22")
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.avatarURL())
            
                db.forEach(bug => {
                    embed.addField(`ID: ${String(bug._id)}`, `**Content:** ${bug.content}` || "No description provided")
                })

            return message.reply({
                embeds: [ embed ]
            })
        }
    }
}