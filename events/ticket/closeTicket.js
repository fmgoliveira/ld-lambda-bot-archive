const { ButtonInteraction, MessageEmbed, Client, MessageActionRow, MessageButton } = require("discord.js")
const { createTranscript } = require("discord-html-transcripts")

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return
        if (interaction.customId.split("-")[0] !== "ticket") return

        const db = client.db.tickets
        const { guild, member, channel } = interaction
        const customId = interaction.customId.split("-")[1]
        const guildDb = await client.db.guilds.findOne({ guildId: guild.id }) || new client.db.guilds({ guildId: guild.id })
        const logChannel = guild.channels.cache.get(guildDb.tickets.logChannel)

        if (!["close_confirm", "close_cancel", "close_save", "close_delete"].includes(customId)) return

        db.findOne({ channelId: channel.id }, async (err, docs) => {
            if (err) throw err
            if (!docs) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription("❌ | This ticket was not found in the database.")
                ],
                ephemeral: true
            })

            const panelDb = await client.db.ticketPanels.findOne({ _id: docs.type })
            if (!panelDb && !member.permissionsIn(channel).has("MANAGE_GUILD")) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription("❌ | You don't have permissions to use these buttons.")
                ],
                ephemeral: true
            })

            if (!member.roles.cache.has(panelDb.supportRole) && member.id !== docs.memberId) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription("❌ | You don't have permissions to use this button.")
                ],
                ephemeral: true
            })

            switch (customId) {
                case "close_cancel":
                    return interaction.message.delete().catch(err => {
                        interaction.deferUpdate()
                        return console.log(err)
                    })
                    break

                case "close_confirm":
                    if (docs.closed == true) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription("❌ | This ticket is already closed.")
                        ],
                        ephemeral: true
                    })

                    interaction.message.delete().catch(err => {
                        interaction.deferUpdate()
                        return console.log(err)
                    })

                    const attachment = await createTranscript(channel, {
                        limit: -1,
                        returnBuffer: false,
                        fileName: `${channel.name}-transcript.html`
                    })

                    await db.updateOne({ channelId: channel.id }, { closed: true })
                    channel.permissionOverwrites.edit(docs.memberId, {
                        VIEW_CHANNEL: true
                    })

                    docs.otherMembers.forEach(m => {
                        channel.permissionOverwrites.edit(m, {
                            VIEW_CHANNEL: true
                        })
                    })

                    const Member = guild.members.cache.get(docs.memberId)

                    let Message
                    if (logChannel) Message = await logChannel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor({ name: Member.user.tag, iconURL: Member.user.avatarURL({ dynamic: true }) })
                                .setTitle("Ticket Closed")
                                .setDescription(`Ticket ${channel.name} was **closed** by ${member.user.tag}.\n**Category Label:** ${panelDb.label}`)
                                .setFooter(client.footer)
                                .setTimestamp()
                                .setColor("RED")
                        ],
                        files: [attachment]
                    })

                    await interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`🔴 | This ticket has been closed. ${Message ? "[Go to transcript](" + Message.url + ")" : ""}`)
                                .setColor(client.color)
                        ],
                        components: [
                            new MessageActionRow().addComponents(
                                new MessageButton()
                                    .setCustomId("ticket-close_save")
                                    .setEmoji("📑")
                                    .setLabel("Transcript")
                                    .setStyle("SECONDARY"),
                                new MessageButton()
                                    .setCustomId("ticket-close_open")
                                    .setEmoji("🔓")
                                    .setLabel("Re-open")
                                    .setStyle("SUCCESS"),
                                new MessageButton()
                                    .setCustomId("ticket-close_delete")
                                    .setEmoji("🗑️")
                                    .setLabel("Delete")
                                    .setStyle("DANGER")
                            )
                        ]
                    }).then(msg => msg.pin())

                    break

                case "close_save":
                    if (docs.closed == false) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription("❌ | This ticket is not closed.")
                        ],
                        ephemeral: true
                    })

                    const _attachment = await createTranscript(channel, {
                        limit: -1,
                        returnBuffer: false,
                        fileName: `${channel.name}-transcript.html`
                    })

                    if (logChannel) logChannel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setFooter(client.footer)
                                .setTimestamp()
                                .setTitle("Ticket Transcript Created")
                                .setDescription(`Ticket <#${channel.id}> has been transcripted by ${member.user.tag}.`)
                        ]
                    })

                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`📑 | Ticket transcript (\`${channel.name}-transcript.html\`)`)
                                .setColor(client.color)
                        ],
                        files: [_attachment]
                    })

                    break

                case "close_open":
                    if (docs.closed == false) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription("❌ | This ticket is not closed.")
                        ],
                        ephemeral: true
                    })

                    await db.updateOne({ channelId: channel.id }, { closed: false })
                    channel.permissionOverwrites.edit(docs.memberId, {
                        VIEW_CHANNEL: true
                    })

                    docs.otherMembers.forEach(m => {
                        channel.permissionOverwrites.edit(m, {
                            VIEW_CHANNEL: true
                        })
                    })

                    if (logChannel) logChannel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setFooter(client.footer)
                                .setTimestamp()
                                .setTitle("Ticket Re-opened")
                                .setDescription(`Ticket <#${channel.id}> has been re-opened by ${member.user.tag}.`)
                        ]
                    })

                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`✅ | Ticket successfully re-opened.`)
                                .setColor(client.color)
                        ]
                    })

                    break

                case "close_delete":
                    if (docs.closed == false) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription("❌ | This ticket is not closed.")
                        ],
                        ephemeral: true
                    })

                    await db.deleteOne({ channelId: channel.id })

                    if (logChannel) logChannel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setFooter(client.footer)
                                .setTimestamp()
                                .setTitle("Ticket Deleted")
                                .setDescription(`Ticket <#${channel.id}> has been deleted by ${member.user.tag}.`)
                        ]
                    })

                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`🗑️ | Ticket will be deleted in 5 seconds.`)
                                .setColor("RED")
                        ]
                    })

                    setTimeout(() => {
                        channel.delete().catch(err => interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(`❌ | Could not delete the ticket channel. It has been already deleted from the database, please delete the channel manually.`)
                                    .setColor("RED")
                            ]
                        }))
                    }, 5000)

                    break
            }
        })
    }
}