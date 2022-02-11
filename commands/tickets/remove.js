const { CommandInteraction, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "remove",
    description: "Remove a member from a ticket.",
    category: "tickets",
    options: [
        {
            name: "member",
            description: "Member that will be removed from the ticket.",
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
                    .setColor("RED")
                    .setDescription("❌ | You don't have permission to use this command.")
            ],
            ephemeral: true
        })

        channel.permissionOverwrites.edit(member.id, {
            VIEW_CHANNEL: false
        })

        if (!db.otherMembers.includes(member.id)) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setDescription("❌ | The specified user isn't in this ticket channel.")
            ],
            ephemeral: true
        })

        db.otherMembers.remove(member.id)
        db.save()

        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`🔴 | <@${member.id}> has been successfully removed to this ticket.`)
                    .setColor(client.color)
            ]
        })
    }
}