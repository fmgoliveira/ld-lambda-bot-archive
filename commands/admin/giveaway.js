const { CommandInteraction, MessageEmbed, Client } = require("discord.js")

module.exports = {
    name: "giveaway",
    description: "Setup and manage giveaways in the server.",
    category: "admin",
    userPermissions: ["MANAGE_GUILD"],
    options: [
        {
            name: "start",
            description: "Start a giveaway.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "duration",
                    description: "Duration for the giveaway (1m, 1h, 1d...).",
                    type: "STRING",
                    required: true
                },
                {
                    name: "winners",
                    description: "Amount of winners for the giveaway.",
                    type: "INTEGER",
                    minValue: 1,
                    required: true
                },
                {
                    name: "prize",
                    description: "What will you give to the winner(s).",
                    type: "STRING",
                    required: true
                },
                {
                    name: "channel",
                    description: "Channel to send the giveaway to.",
                    type: "CHANNEL",
                    channelTypes: ["GUILD_TEXT"]
                }
            ]
        },
        {
            name: "end",
            description: "End the giveaway.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "message_id",
                    description: "Giveaway message ID.",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "pause",
            description: "Pause the giveaway.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "message_id",
                    description: "Giveaway message ID.",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "unpause",
            description: "Unpause the giveaway.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "message_id",
                    description: "Giveaway message ID.",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "reroll",
            description: "Reroll the giveaway.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "message_id",
                    description: "Giveaway message ID.",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "delete",
            description: "Delete the giveaway.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "message_id",
                    description: "Giveaway message ID.",
                    type: "STRING",
                    required: true
                }
            ]
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const subCommand = interaction.options.getSubcommand()
        const giveaway = client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === interaction.options.getString("message_id"))

        if (subCommand === "start") {
            return require(`../../utils/subCommands/giveaway/${subCommand}`)(interaction, client)
        } else {
            if (!giveaway) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setDescription(`Couldn't find a giveaway with message ID \`${interaction.options.getString("message_id")}\`. Please provide a valid ID.`)
                        .setTimestamp()
                        .setColor("RED")
                        .setFooter(client.footer)
                ],
                ephemeral: true
            })

            return require(`../../utils/subCommands/giveaway/${subCommand}`)(interaction, client, interaction.options.getString("message_id"), giveaway.channelId)
        }
    }
}