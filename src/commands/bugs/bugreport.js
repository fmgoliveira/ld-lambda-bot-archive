const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

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

        const LambdaGuild = this.client.guilds.cache.get(process.env.LAMBDA_GUILD_ID)
        const channel = LambdaGuild.channels.cache.get(process.env.BUGS_CHANNEL_ID)
        const user = message.member.user.tag
        const guild = `${message.member.guild.name} (\`${message.member.guild.id}\`)`

        const BugDB = new this.client.db.bugs({ content: bugMessage, user: user, guild: guild, status: "Reported" })
        BugDB.save()

        function createButtons(verifyDisabled = false, resolvedDisabled = true, onHoldDisabled = true, wontFixDisabled = true) {
            const Menu1 = new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("✅")
                    .setLabel("Verify")
                    .setStyle("SUCCESS")
                    .setCustomId("bug-verify")
                    .setDisabled(verifyDisabled)
            )

            const Menu2 = new MessageActionRow().addComponents([
                new MessageButton()
                    .setEmoji("<:status_green:906087473627668490>")
                    .setLabel("Mark as 'Resolved'")
                    .setStyle("SECONDARY")
                    .setCustomId("bug-resolve")
                    .setDisabled(resolvedDisabled),
                new MessageButton()
                    .setEmoji("<:status_yellow:906087532356304906>")
                    .setLabel("Mark as 'On Hold'")
                    .setStyle("SECONDARY")
                    .setCustomId("bug-onhold")
                    .setDisabled(onHoldDisabled),
                new MessageButton()
                    .setEmoji("<:status_red:906087602447335424>")
                    .setLabel("Mark as 'Won't Fix'")
                    .setStyle("SECONDARY")
                    .setCustomId("bug-wontfix")
                    .setDisabled(wontFixDisabled)
            ])

            return [Menu1, Menu2]
        }

        const reply = await channel.send({
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
            components: createButtons(),
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
            ephemeral: true,
            components: [new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("<:logo:906086580354162698>")
                    .setLabel("Join Lambda Group")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )]
        })
    }
}