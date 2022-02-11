const { CommandInteraction, Client, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")

module.exports = {
    name: "slowmode",
    description: "Changes a channel's slowmode.",
    category: "moderation",
    botPermissions: ["MANAGE_CHANNELS"],
    userPermissions: ["MANAGE_CHANNELS"],
    options: [
        {
            name: "seconds",
            type: "NUMBER",
            minValue: 0,
            description: "The amount of seconds that the slowmode will be set to.",
            required: true
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const amount = interaction.options.getNumber("seconds")

        interaction.channel.setRateLimitPerUser(amount)

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.color)
                    .setDescription(`Successfully set the slowmode of <#${interaction.channel.id}> to \`${amount}s\`.`)
            ]
        })
    }
}