const { MessageEmbed, MessageActionRow, MessageButton, Message } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "buginfo",
            description: "Show information about a bug.",
            category: "bugs",
            usage: "<bug_id>",
            options: [
                {
                    type: "STRING",
                    name: "bug_id",
                    description: "The id of the bug you want to find.",
                    required: true
                }
            ]
        })
    }

    run = async (message) => {
        const bugId = message.options.getString("bug_id")
        let db
        try {
            db = await this.client.db.bugs.findById(bugId)
        } catch (err) {
            console.log(err)
            return message.reply({
                embeds: [new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("Could not find a bug report with that ID. \n**Please inform a valid one**.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                ],
                ephemeral: true,
                components: [
                    new MessageActionRow().addComponents(new MessageButton().setEmoji("<:logo:921033010764218428>").setLabel("Join Lambda Development").setStyle("LINK").setURL(process.env.SERVER_LINK))
                ]
            })
        }

        if (!db) return message.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setDescription("Could not find a bug report with that ID. \n**Please inform a valid one**.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(new MessageButton().setEmoji("<:logo:921033010764218428>").setLabel("Join Lambda Group").setStyle("LINK").setURL(process.env.SERVER_LINK))
            ]
        })

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Bug Report`)
                    .addField("ID", String(db._id), true)
                    .addField("Description", db.content)
                    .addField("Status", db.status, true)
                    .setTimestamp()
                    .setColor("#ffa726")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })
    }
}