const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = async (client, interaction, database) => {
    const guildId = interaction.customId.split("_")[1]
    const guild = client.guilds.cache.get(guildId)

    if (!guild || !guild.available) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setColor("RED")
                .setFooter(client.user.username, client.user.avatarURL())
                .setDescription("Could not create an invite for that guild.")
        ]
    })

    let url

    try {
        await guild.invites.create(guild.channels.cache.filter((channel) => channel.type === 'GUILD_TEXT').first(), {
            maxAge: 30
        }).then(invite => { url = invite.url }).catch(err => { })
    } catch (err) {
        console.log(err)
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setColor("RED")
                    .setFooter(client.user.username, client.user.avatarURL())
                    .setDescription("Could not create an invite for that guild.")
            ]
        })
    }

    return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Join Server")
                .setDescription(`Click on the button below to join the guild with name **${guild.name}** and ID \`${guild.id}\``)
                .setFooter("You have 30 seconds to click on the button.", client.user.avatarURL())
                .setColor("GREEN")
                .setTimestamp()
        ],
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("🔗")
                    .setLabel("Join server")
                    .setStyle("LINK")
                    .setURL(url)
            )
        ],
        fetchReply: true
    }).then(msg => {
        setTimeout(() => {
            try {
                msg.delete()
            } catch (err) { console.log(err) }
        }, 30000)
    }).catch(err => {
        console.log(err)
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setColor("RED")
                    .setFooter(client.user.username, client.user.avatarURL())
                    .setDescription("Could not create an invite for that guild.")
            ]
        })
    })
}