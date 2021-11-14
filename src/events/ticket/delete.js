const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js")

module.exports = (client, interaction, database) => {
    try {
        interaction.channel.delete()
        interaction.deferUpdate()
    } catch {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("Missing permissions. I can't delete a channel in this category. Please make sure I can do it and try again.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(client.user.username, client.user.avatarURL())
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setEmoji("<:logo:906086580354162698>")
                        .setLabel("Join Lambda Group")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )
            ]
        })
    }
}