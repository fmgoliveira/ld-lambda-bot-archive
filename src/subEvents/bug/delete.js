const { MessageEmbed } = require("discord.js")
const bugButtons = require("../../structures/components/bugButtons")

module.exports = async (client, interaction, database) => {
    const message = interaction.message

    await client.db.bugs.findOneAndDelete({
        _id: message.embeds[0].fields[0].value
    })

    return interaction.deferUpdate(message.delete())
}