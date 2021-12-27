const { MessageEmbed } = require("discord.js")
const bugButtons = require("../../structures/components/bugButtons")

module.exports = async (client, interaction, database) => {
    const message = interaction.message

    const BugDB = await client.db.bugs.findOneAndUpdate({
        _id: message.embeds[0].fields[0].value
    }, {
        _id: message.embeds[0].fields[0].value,
        status: "<:status_red:906087602447335424> Won't Fix"
    })

    let content = {
        embeds: [
            new MessageEmbed()
                .setTitle(`Bug Report`)
                .addField("ID", String(BugDB._id), true)
                .addField("Description", BugDB.content)
                .addField("Reported by", BugDB.user, true)
                .addField("Guild", BugDB.guild, true)
                .addField("Status", "<:status_red:906087602447335424> Won't Fix", true)
                .setTimestamp()
                .setColor("RED")
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        components: bugButtons(true, false, false, true)
    }

    return interaction.deferUpdate(message.edit(content))
}