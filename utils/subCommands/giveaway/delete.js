const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const ms = require("ms")

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {Client} client 
 */
module.exports = (interaction, client, messageId, channelId) => {
    const gChannel = interaction.options.getChannel("channel") || interaction.channel
    const viewChannel = interaction.guild.me.permissionsIn(interaction.guild.channels.cache.get(channelId)).has("VIEW_CHANNEL")
    const sendMessages = interaction.guild.me.permissionsIn(interaction.guild.channels.cache.get(channelId)).has("SEND_MESSAGES")

    if (!viewChannel || !sendMessages) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription(`I do not have permission to send/edit/delete messages in <#${gChannel.id}>. Please contact one of the server's administrators to fix my permissions. I need the \`SEND_MESSAGES\` & \`VIEW_CHANNEL\` permissions in <#${gChannel.id}> to execute that command.`)
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

    client.giveawaysManager.delete(messageId).then(() => {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription("Giveaway successfully deleted!")
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
                    .setDescription(`An error ocurred while trying to delete the giveaway.\n\`${String(err).substring(0, 3600)}\``)
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