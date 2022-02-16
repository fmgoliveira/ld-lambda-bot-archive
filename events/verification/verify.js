const { ButtonInteraction, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return
        if (interaction.customId !== "verification-verify") return

        const db = await client.db.guilds.findOne({ guildId: interaction.guildId }) || new client.db.guilds({ guildId: interaction.guildId })
        const vDb = db.verification

        if (!vDb.active) return interaction.reply({ embeds: [new MessageEmbed().setDescription("❌ | Verification module is not enabled.").setColor("RED")], ephemeral: true })
        const { guild, member } = interaction

        if (member.roles.cache.has(vDb.role)) return interaction.reply({ embeds: [new MessageEmbed().setDescription("⛔ | You are already verified.").setColor("RED")], ephemeral: true })

        try {
            member.roles.add(vDb.role).catch(err => {
                console.log(err)
                return interaction.reply({ embeds: [new MessageEmbed().setDescription("❌ | Could not verify you.").setColor("RED")], ephemeral: true })
            })
        } catch (err) {
            console.log(err)
            return interaction.reply({ embeds: [new MessageEmbed().setDescription("❌ | Could not verify you.").setColor("RED")], ephemeral: true })
        }

        if (db.autorole.active) {
            try {
                member.roles.add(db.autorole.id).catch(err => console.log(err))
            } catch (err) { console.log(err) }
        }

        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`✅ | You have been successfully verified.`)
                    .setColor("GREEN")
            ],
            ephemeral: true
        })
    }
}