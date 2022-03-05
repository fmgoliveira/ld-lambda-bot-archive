const { ButtonInteraction, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const placeholderReplace = require("../../utils/placeholderReplace")

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
        const { guild, member } = interaction
        const customId = interaction.customId.split("-")[1]
        if (customId !== "create") return

        const id = interaction.customId.split("-")[2]
        const panelDb = await client.db.ticketPanels.findOne({ _id: id })
        if (!panelDb) return

        const tickets = await db.find({ type: panelDb._id, memberId: interaction.user.id, closed: false })
        if (!guild.members.cache.get(client.user.id).permissionsIn(panelDb.category).has("MANAGE_CHANNELS")) return

        if (panelDb.maxTickets > 0 && tickets.length >= panelDb.maxTickets) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription("❌ | You have exceeded your maximum amount of tickets in this category.")
                    .setColor("RED")
            ],
            ephemeral: true
        })

        let length
        const guildDb = await client.db.guilds.findOne({ guildId: guild.id }) || new client.db.guilds({ guildId: guild.id })
        if (guildDb.tickets.ticketCount) length = guildDb.tickets.ticketCount
        else length = 0
        guildDb.tickets.ticketCount = length + 1
        guildDb.save()

        await guild.channels.cache.get(panelDb.category).createChannel(`ticket-${length + 1}`, {
            type: "GUILD_TEXT",
            permissionOverwrites: [
                {
                    id: member.id,
                    allow: [
                        "SEND_MESSAGES",
                        "VIEW_CHANNEL",
                        "READ_MESSAGE_HISTORY"
                    ]
                },
                {
                    id: guild.id,
                    deny: [
                        "SEND_MESSAGES",
                        "VIEW_CHANNEL",
                        "READ_MESSAGE_HISTORY"
                    ]
                },
                {
                    id: panelDb.supportRole,
                    allow: [
                        "SEND_MESSAGES",
                        "VIEW_CHANNEL",
                        "READ_MESSAGE_HISTORY"
                    ]
                }
            ]
        }).then(async (channel) => {
            await db.create({
                guildId: guild.id,
                memberId: member.id,
                ticketId: length + 1,
                channelId: channel.id,
                closed: false,
                locked: false,
                type: panelDb._id
            })

            if (guildDb.tickets.logChannel) {
                try {
                    const log_channel = interaction.guild.channels.cache.get(guildDb.tickets.logChannel)
                    log_channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Ticket Created")
                                .setDescription(`Ticket <#${channel.id}> was **created** by ${member.user.tag} in the category with label \`${panelDb.label}\`.`)
                                .setFooter(client.footer)
                                .setTimestamp()
                                .setColor("GREEN")
                        ]
                    }).catch(err => console.log(err))
                } catch (err) { console.log(err) }
            }

            const embed = new MessageEmbed()
                .setAuthor({ name: `${guild.name.substring(0, 200)} | Ticketing System` })
                .setTitle(panelDb.label)
                .setDescription(placeholderReplace(panelDb.welcomeMessage.message, guild, member.user))
                .setFooter(client.footer)
                .setTimestamp()
                .setColor(panelDb.welcomeMessage.color)

            const buttons = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("ticket-close")
                    .setEmoji("💾")
                    .setStyle("PRIMARY")
                    .setLabel("Save & Close"),
                new MessageButton()
                    .setCustomId("ticket-lock")
                    .setEmoji("🔒")
                    .setStyle("SECONDARY")
                    .setLabel("Lock"),
                new MessageButton()
                    .setCustomId("ticket-unlock")
                    .setEmoji("🔓")
                    .setStyle("SECONDARY")
                    .setLabel("Unlock"),
                new MessageButton()
                    .setCustomId("ticket-claim")
                    .setEmoji("✋")
                    .setStyle("SUCCESS")
                    .setLabel("Claim")
            )

            channel.send({ embeds: [embed], components: [buttons] })

            await channel.send({ content: `<@&${panelDb.supportRole}>, <@${member.id}> created a ticket.` }).then(msg => {
                setTimeout(() => { msg.delete().catch(err => console.log(err)) }, 1500)
            }).catch(err => console.log(err))

            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`🎫 | Your ticket has been created in <#${channel.id}> successfully.`)
                        .setColor("GREEN")
                ],
                ephemeral: true
            })
        }).catch(err => {
            console.log(err)

        })
    }
}
