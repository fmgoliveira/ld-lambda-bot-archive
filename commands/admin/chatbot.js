const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "chatbot",
    description: "Configure the Chatbot functionality.",
    category: "admin",
    userPermissions: ["MANAGE_GUILD"],
    options: [
        {
            name: "channel",
            type: "SUB_COMMAND",
            description: "Add/Remove channels where the Chatbot functionality can be used.",
            options: [
                {
                    name: "action",
                    description: "Add or remove a channel.",
                    type: "STRING",
                    choices: [
                        { name: "add", value: "add" },
                        { name: "remove", value: "remove" }
                    ],
                    required: true
                },
                {
                    name: "channel",
                    description: "The channel you want to add/remove.",
                    type: "CHANNEL",
                    channelTypes: ["GUILD_TEXT"],
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
        const { options, guild } = interaction
        const guildDb = await client.db.guilds.findOne({ guildId: guild.id }) || new client.db.guilds({ guildId: guild.id })

        const action = options.getString("action")
        const channel = options.getChannel("channel")

        switch (action) {
            case "add":
                if (guildDb.chatbotChannels.includes(channel.id)) return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle("Error")
                        .setDescription(`Channel ${channel} is already allowed.`)
                        .setFooter(client.footer)
                        .setColor("RED")
                    ],
                    ephemeral: true
                })

                guildDb.chatbotChannels.push(channel.id)
                await guildDb.save()

                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle("Success")
                        .setDescription(`Channel ${channel} allowed: now Chatbot can be used there.`)
                        .setFooter(client.footer)
                        .setColor(client.color)
                    ]
                })
                break

            case "remove":
                if (!guildDb.chatbotChannels.includes(channel.id)) return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle("Error")
                        .setDescription(`Channel ${channel} is not allowed yet.`)
                        .setFooter(client.footer)
                        .setColor("RED")
                    ],
                    ephemeral: true
                })

                guildDb.chatbotChannels.remove(channel.id)
                await guildDb.save()

                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                        .setTitle("Success")
                        .setDescription(`Channel ${channel} not allowed: now Chatbot cannot be used there.`)
                        .setFooter(client.footer)
                        .setColor(client.color)
                    ]
                })
                break
        }
    }
}