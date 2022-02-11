const { MessageEmbed, ContextMenuInteraction, Client } = require("discord.js")

module.exports = {
    name: "User Avatar",
    type: "USER",
    context: true,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const target = await interaction.guild.members.fetch(interaction.targetId)

        const avatar = target.user.avatarURL({ dynamic: true, size: 1024 })
        const embed = new MessageEmbed()
            .setAuthor({ name: `${target.user.tag}`, iconURL: avatar })
            .setImage(avatar)
            .setColor(client.color)

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}