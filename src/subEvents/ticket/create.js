const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js")
const placeholderReplace = require("../../structures/utils/placeholderReplace")

module.exports = async (client, interaction, database) => {
    if (!database.tickets.active) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("Tickets module is not enabled. Please enable it first in the [dashboard](https://bot.lambdadev.xyz/dashboard).")
                .setColor("RED")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("<:logo:921033010764218428>")
                    .setLabel("Join Lambda Development")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )
        ]
    })

    const panel = await client.db.ticketPanels.findById(interaction.customId.split("-")[2])

    if (!panel) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("There was an error when trying to create a ticket in that category. Please check with the server admins if the panels are fully configurated in the [dashboard](https://bot.lambdadev.xyz/dashboard).")
                .setColor("RED")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("<:logo:921033010764218428>")
                    .setLabel("Join Lambda Development")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )
        ]
    })

    const category = panel.category

    var length

    if (database.tickets.ticketCount) length = database.tickets.ticketCount
    else length = 0

    const tickets = await client.db.tickets.find({ category: panel._id, user: interaction.user.id, opened: true })

    if (panel.maxTickets > 0 && tickets.length >= panel.maxTickets) return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Error")
                .setDescription("You have exceeded your maximum amount of tickets in this category.")
                .setColor("RED")
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
        ],
        ephemeral: true
    })

    try {
        interaction.guild.channels.cache.get(category).createChannel(`ticket-${length + 1}`, {
            topic: `Ticket Channel for ${interaction.member.user.tag}`,
            permissionOverwrites: [
                {
                    id: interaction.member.id,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY]
                },
                {
                    id: interaction.guild.id,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL]
                }
            ]
        }).then(async (channel) => {
            if (database.tickets.logChannel) {
                try {
                    const log_channel = interaction.guild.channels.cache.get(database.tickets.logChannel)
                    log_channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Ticket Created")
                                .setDescription(`Ticket <#${channel.id}> was **created** by ${interaction.member.user.tag} in the category with label \`${panel.label}\`.`)
                                .setFooter(client.user.username, client.user.avatarURL())
                                .setTimestamp()
                                .setColor("GREEN")
                        ]
                    })
                } catch (err) { console.log(err) }
            }

            let role = panel.supportRole
            channel.send(`<@&${role}>`).then(msg => {
                setTimeout(() => { msg.delete() }, 1500)
            }).catch(err => console.log(err))

            channel.permissionOverwrites.create(role, { "VIEW_CHANNEL": true, "SEND_MESSAGES": true })
            channel.permissionOverwrites.create(interaction.guild.id, { "VIEW_CHANNEL": false, "SEND_MESSAGES": false })
            channel.permissionOverwrites.create(interaction.member.id, { "VIEW_CHANNEL": true, "SEND_MESSAGES": true })

            await client.db.tickets.create({
                id: channel.id,
                guildId: interaction.guild.id,
                category: panel._id,
                user: interaction.member.id
            })

            channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle(panel.label)
                        .setDescription(placeholderReplace(panel.welcomeMessage.message, interaction.guild, interaction.member.user))
                        .setColor(panel.welcomeMessage.color)
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
    } catch (err) {
        console.log(err)
        
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
                        .setEmoji("<:logo:921033010764218428>")
                        .setLabel("Support Server")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )
            ]
        })
    }
}