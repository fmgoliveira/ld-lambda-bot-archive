const { MessageEmbed, ContextMenuInteraction, Client } = require("discord.js")

module.exports = {
    name: "avatar",
    description: "Get a user's avatar",
    options: [
        {
            name: "user",
            type: "USER",
            description: "The user you want to get their avatar."
        }
    ],
    category: "utility",
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const target = interaction.options.getUser("user") || interaction.user

        const avatar = target.avatarURL({ dynamic: true, size: 1024 })
        const embed = new MessageEmbed()
            .setAuthor({ name: `${target.tag}`, iconURL: avatar })
            .setImage(avatar)
            .setColor(client.color)

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}