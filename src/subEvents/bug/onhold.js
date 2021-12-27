const { MessageEmbed } = require("discord.js")
const bugButtons = require("../../structures/components/bugButtons")

module.exports = async (client, interaction, database) => {
    const message = interaction.message

    const BugDB = await client.db.bugs.findOneAndUpdate({
        _id: message.embeds[0].fields[0].value
    }, {
        _id: message.embeds[0].fields[0].value,
        status: "<:status_yellow:906087532356304906> On Hold"
    })

    let content = {
        embeds: [
            new MessageEmbed()
                .setTitle(`Bug Report`)
                .addField("ID", String(BugDB._id), true)
                .addField("Description", BugDB.content)
                .addField("Reported by", BugDB.user, true)
                .addField("Guild", BugDB.guild, true)
                .addField("Status", "<:status_yellow:906087532356304906> On Hold", true)
                .setTimestamp()
                .setColor("GOLD")
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        components: bugButtons(true, false, true, false)
    }

    return interaction.deferUpdate(message.edit(content))
}