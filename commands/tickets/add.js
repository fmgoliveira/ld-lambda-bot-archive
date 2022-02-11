const { CommandInteraction, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "add",
    description: "Add a member to a ticket.",
    category: "tickets",
    options: [
        {
            name: "member",
            description: "Member that will be added to the ticket.",
            type: "USER",
            required: "true"
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const { guildId, options, channel } = interaction
        const member = options.getUser("member")

        const db = await client.db.tickets.findOne({ channelId: channel.id })

        if (!db) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setDescription("❌ | You can only use this command in a ticket channel.")
            ],
            ephemeral: true
        })

        const panelDb = client.db.ticketPanels.findOne({ _id: db.type })
        if (!panelDb) return

        if (!interaction.member.roles.cache.has(panelDb.supportRole)) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTimestamp()
                    .setDescription("❌ | You don't have permission to use this command.")
            ],
            ephemeral: true
        })

        channel.permissionOverwrites.edit(member.id, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true
        })

        if (db.otherMembers.includes(member.id)) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setDescription("❌ | The specified user is already in this ticket channel.")
            ],
            ephemeral: true
        })

        db.otherMembers.push(member.id)
        db.save()

        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`🟢 | <@${member.id}> has been successfully added to this ticket.`)
                    .setColor(client.color)
            ]
        })
    }
}