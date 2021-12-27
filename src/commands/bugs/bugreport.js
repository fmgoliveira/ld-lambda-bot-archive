const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")
const bugButtons = require("../../structures/components/bugButtons")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "bugreport",
            description: "Report a bug.",
            category: "bugs",
            usage: "<bug_description>",
            options: [
                {
                    type: "STRING",
                    name: "bug_message",
                    description: "Describe the bug you found.",
                    required: true
                }
            ]
        })
    }

    run = async (message) => {
        const bugMessage = message.options.getString("bug_message")

        const LambdaGuild = this.client.guilds.cache.get(process.env.LAMBDA_STAFF_GUILD_ID)
        const channel = LambdaGuild.channels.cache.get(process.env.BUGS_CHANNEL_ID)
        const user = message.member.user.tag
        const guild = `${message.member.guild.name} (\`${message.member.guild.id}\`)`

        const BugDB = new this.client.db.bugs({ content: bugMessage, user: user, guild: guild, status: "Reported" })
        BugDB.save()

        channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Bug Report`)
                    .addField("ID", String(BugDB._id), true)
                    .addField("Description", BugDB.content)
                    .addField("Reported by", BugDB.user, true)
                    .addField("Guild", BugDB.guild, true)
                    .addField("Status", BugDB.status, true)
                    .setTimestamp()
                    .setColor("#ffa726")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            components: bugButtons(),
            fetchReply: true
        })

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Success`)
                    .setDescription("Bug Report sent successfully!")
                    .addField("Report ID", String(BugDB._id), true)
                    .addField("Message", BugDB.content, true)
                    .setTimestamp()
                    .setColor("#fff59d")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            ephemeral: true
        })
    }
}