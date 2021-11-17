const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js")

module.exports = (client, interaction, database) => {
    if (!database.tickets?.category || database.tickets?.category === "") return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("Ticket category is not set yet. Please ask a server administrator to set it using `/config tickets category <category>`.")
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

    const category = client.channels.cache.get(database.tickets.category)

    var length

    if (database.tickets?.ticketCount) length = database.tickets.ticketCount
    else length = 0

    try {
        category.createChannel(`ticket-${length + 1}`, {
            topic: `Ticket Channel for ${interaction.member.user.tag}`,
            permissionOverwrites: [
                {
                    id: interaction.member.id,
                    allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY ]
                }
            ]
        }).then((channel) => {
            if (database.tickets.log_channel) {
                try {
                    const log_channel = interaction.guild.channels.cache.get(database.tickets.log_channel)
                    log_channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Ticket Created")
                                .setDescription(`Ticket \`${channel.name}\` was **created** by ${interaction.member.user.tag}.`)
                                .setFooter(client.user.username, client.user.avatarURL())
                                .setTimestamp()
                                .setColor("GREEN")
                        ]
                    })
                } catch (err) {console.log(err)}
            }
            
            let roleMsg
            const role = database.tickets?.support_role
            if (role) roleMsg = `<@&${role}>, ` 
            else roleMsg = ""

            channel.send({
                content: `${roleMsg}<@${interaction.member.id}> opened a ticket.`,
                embeds: [
                    new MessageEmbed()
                        .setTitle("Support Ticket")
                        .setDescription(`The support team of **${interaction.guild.name}** has been notified. Please provide as much information related to your issue as possible and wait patiently.`)
                        .setColor("#ffa726")
                        .setFooter(client.user.username, client.user.avatarURL())
                        .setTimestamp()
                ],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setEmoji("<:redcross:758380151238033419>")
                            .setLabel("Close Ticket")
                            .setCustomId("ticket-close")
                            .setStyle("DANGER")
                    )
                ],
                fetchReply: true
            }).then((msg) => {

                msg.pin()

                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Ticket")
                            .setDescription(`Your ticket has been created! Click the button below to jump to it.`)
                            .setColor("GREEN")
                            .setFooter(client.user.username, client.user.avatarURL())
                            .setTimestamp()
                    ],
                    ephemeral: true,
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setEmoji("🎫")
                                .setLabel("Jump to Ticket")
                                .setStyle("LINK")
                                .setURL(msg.url)
                        )
                    ]
                })

                async function databaseSave(database) {
                    await database.save()
                }
                
                database.tickets.ticketCount = length + 1
                databaseSave(database)
            })
    })
    } catch {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Something went wrong")
                    .setDescription("There was an error while trying to execute that action.")
                    .setColor("RED")
                    .setFooter(client.user.username, client.user.avatarURL())
                    .setTimestamp()
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setEmoji("<:logo:906086580354162698>")
                        .setLabel("Support Server")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )
            ]
        })
    }
}