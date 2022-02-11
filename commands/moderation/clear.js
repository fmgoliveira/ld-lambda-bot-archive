const { CommandInteraction, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "clear",
    description: "Purge messages in this channel.",
    category: "moderation",
    botPermissions: ["MANAGE_MESSAGES"],
    userPermissions: ["MANAGE_MESSAGES"],
    options: [
        {
            name: "amount",
            description: "Amount of messages to purge.",
            type: "NUMBER",
            required: true
        },
        {
            name: "target",
            description: "The user to purge their messages.",
            type: "USER",
            required: false
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const { channel, options } = interaction

        const amount = options.getNumber("amount")
        const target = options.getUser("target")

        const messages = await channel.messages.fetch()

        const response = new MessageEmbed()
            .setColor(client.color)
            .setTimestamp()
            .setFooter(client.footer)
            .setTitle("Success")

        if (target) {
            let i = 0
            const filtered = []

            messages.filter((m) => {
                if (m.author.id === target.id && amount > i) {
                    filtered.push(m)
                    i++
                }
            })

            await channel.bulkDelete(filtered, true).then(messages => {
                response.setDescription(`Successfully deleted \`${messages.size}\` messages from ${target}.`)
                interaction.reply({ embeds: [response], ephemeral: true })
            })
        } else {
            await channel.bulkDelete(amount, true).then(messages => {
                response.setDescription(`Successfully deleted \`${messages.size}\` messages from this channel.`)
                interaction.reply({ embeds: [response], ephemeral: true })
            })
        }
    }
}