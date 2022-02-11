const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const ms = require("ms")

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {Client} client 
 */
module.exports = (interaction, client) => {
    const gChannel = interaction.options.getChannel("channel") || interaction.channel
    const viewChannel = interaction.guild.me.permissionsIn(gChannel).has("VIEW_CHANNEL")
    const sendMessages = interaction.guild.me.permissionsIn(gChannel).has("SEND_MESSAGES")

    if (!viewChannel || !sendMessages) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription(`I do not have permission to send/edit messages in <#${gChannel.id}>. Please contact one of the server's administrators to fix my permissions. I need the \`SEND_MESSAGES\` & \`VIEW_CHANNEL\` permissions in <#${gChannel.id}> to execute that command.`)
                .setFooter(client.footer)
                .setTimestamp()
                .setColor("RED")
        ],
        ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel("Support Server")
                    .setURL(process.env.LAMBDA_GUILD_LINK)
                    .setStyle("LINK")
            )
        ]
    })

    const duration = interaction.options.getString("duration")
    const winnerCount = interaction.options.getInteger("winners")
    const prize = interaction.options.getString("prize")

    client.giveawaysManager.start(gChannel, {
        duration: ms(duration),
        winnerCount,
        prize,
        messages: {
            giveaway: "🎉 **Giveaway Started** 🎉",
            giveawayEnded: "🎊 **Giveaway Ended** 🎊",
            winMessage: "Congratulations, {winners}! You won **{this.prize}**!"
        }
    }).then(async () => {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription("Giveaway successfully started!")
                    .setColor(client.color)
                    .setFooter(client.footer)
                    .setTimestamp()
            ],
            ephemeral: true
        })
    }).catch(err => {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`An error ocurred while trying to start the giveaway.\n\`${String(err).substring(0, 3600)}\``)
                    .setColor("RED")
                    .setFooter(client.footer)
                    .setTimestamp()
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("Support Server")
                        .setURL(process.env.LAMBDA_GUILD_LINK)
                        .setStyle("LINK")
                )
            ]
        })
    })

}