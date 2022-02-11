const { ButtonInteraction, Client, MessageEmbed } = require("discord.js")

/**
 * 
 * @param {ButtonInteraction} interaction 
 * @param {Client} client 
 */
module.exports = async (interaction, client) => {
    const db = await client.db.users.findOne({ userId: interaction.member.id})

    if (!db) {
        client.db.users.create({ userId: interaction.member.id, acceptedPolicy: false })
    } else {
        db.acceptedPolicy = false
        db.save()
    }

    return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setThumbnail(client.user.avatarURL())
                .setTitle("Success")
                .setDescription("You have successfully **declined** Lambda Development Terms of Service. *You can't use the bot until you accept they.*")
                .setColor(client.color)
                .setTimestamp()
                .setFooter(client.footer)
        ],
        ephemeral: true
    })
}