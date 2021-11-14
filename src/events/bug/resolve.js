const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js")

module.exports = async (client, interaction, database) => {
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

    const message = interaction.message

    const BugDB = await client.db.bugs.findOneAndUpdate({
        _id: message.embeds[0].fields[0].value
    }, {
        _id: message.embeds[0].fields[0].value,
        status: "<:status_green:906087473627668490> Resolved"
    })

    let content = {
        embeds: [
            new MessageEmbed()
                .setTitle(`Bug Report`)
                .addField("ID", String(BugDB._id), true)
                .addField("Description", BugDB.content)
                .addField("Reported by", BugDB.user, true)
                .addField("Guild", BugDB.guild, true)
                .addField("Status", "<:status_green:906087473627668490> Resolved", true)
                .setTimestamp()
                .setColor("GREEN")
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        components: createButtons(true, true, false, false)
    }

    return interaction.deferUpdate(message.edit(content))
}