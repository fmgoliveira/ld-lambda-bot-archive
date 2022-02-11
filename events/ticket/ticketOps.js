const { ButtonInteraction, MessageEmbed, Client } = require("discord.js")
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

        if (!["close", "lock", "unlock", "claim"].includes(customId)) return

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

            if (!member.roles.cache.has(panelDb.supportRole)) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription("❌ | You don't have permissions to use these buttons.")
                ],
                ephemeral: true
            })

            switch (customId) {
                case "lock":
                    if (docs.locked == true) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription("❌ | This ticket is already locked.")
                        ],
                        ephemeral: true
                    })
                    await db.updateOne({ channelId: channel.id }, { locked: true })
                    channel.permissionOverwrites.edit(docs.memberId, {
                        SEND_MESSAGES: false
                    })
                    docs.otherMembers.forEach(m => {
                        channel.permissionOverwrites.edit(m, {
                            SEND_MESSAGES: false
                        })
                    })

                    if (logChannel) logChannel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setFooter(client.footer)
                                .setTimestamp()
                                .setTitle("Ticket Locked")
                                .setDescription(`Ticket <#${channel.id}> has been locked by ${member.user.tag}.`)
                        ]
                    })

                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setDescription("🔒 | This ticket is now locked.")
                        ]
                    })
                    break

                case "unlock":
                    if (docs.locked == false) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription("❌ | This ticket is not locked.")
                        ],
                        ephemeral: true
                    })
                    await db.updateOne({ channelId: channel.id }, { locked: false })
                    channel.permissionOverwrites.edit(docs.memberId, {
                        SEND_MESSAGES: true
                    })

                    docs.otherMembers.forEach(m => {
                        channel.permissionOverwrites.edit(m, {
                            SEND_MESSAGES: true
                        })
                    })

                    if (logChannel) logChannel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setFooter(client.footer)
                                .setTimestamp()
                                .setTitle("Ticket Unlocked")
                                .setDescription(`Ticket <#${channel.id}> has been unlocked by ${member.user.tag}.`)
                        ]
                    })

                    return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setDescription("🔓 | This ticket has been unlocked.")
                        ]
                    })
                    break

                case "close":
                    if (docs.closed == true) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription("❌ | This ticket is already closed.")
                        ],
                        ephemeral: true
                    })

                    const attachment = await createTranscript(channel, {
                        limit: -1,
                        returnBuffer: false,
                        fileName: `${channel.name}-transcript.html`
                    })

                    await db.updateOne({ channelId: channel.id }, { closed: true })

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

                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`💾 | This ticket has been closed. ${Message ? "[Go to transcript](" + Message.url + ")" : ""}`)
                                .setColor(client.color)
                        ]
                    })

                    setTimeout(() => {
                        channel.delete().catch(err => console.log(err))
                    }, 10000)

                    await db.deleteOne({ channelId: channel.id })
                    break

                case "claim":
                    if (docs.claimed == true) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(`❌ | This ticket has already been claimed by <@${docs.claimedBy}>`)
                        ],
                        ephemeral: true
                    })

                    await db.updateOne({ channelId: channel.id }, { claimed: true, claimedBy: member.id })

                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor(client.color)
                                .setDescription(`✋ | This ticket has been claimed by <@${member.id}>`)
                        ]
                    })

                    break
            }
        })
    }
}