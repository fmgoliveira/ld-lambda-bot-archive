const { ButtonInteraction, Client, MessageEmbed } = require("discord.js")

/**
 * 
 * @param {ButtonInteraction} interaction 
 * @param {Client} client 
 */
module.exports = async (interaction, client) => {
    const db = await client.db.users.findOne({ userId: interaction.member.id})

    if (!db) {
        client.db.users.create({ userId: interaction.member.id })
    } else {
        db.acceptedPolicy = true
        db.save()
    }

    return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setThumbnail(client.user.avatarURL())
                .setTitle("Success")
                .setDescription("You have successfully **accepted** Lambda Development Terms of Service. *You can now start using the bot.*")
                .setColor(client.color)
                .setTimestamp()
                .setFooter(client.footer)
        ],
        ephemeral: true
    })
}