const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "autoreact",
    description: "Configure the AutoReact functionality.",
    category: "admin",
    userPermissions: ["MANAGE_GUILD"],
    options: [
        {
            name: "channel",
            type: "SUB_COMMAND_GROUP",
            description: "Add/Remove channels where the bot autoreacts to messages.",
            options: [
                {
                    name: "add",
                    description: "Add a channel.",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "channel",
                            description: "The channel you want to add.",
                            type: "CHANNEL",
                            channelTypes: ["GUILD_TEXT"],
                            required: true
                        },
                        {
                            name: "emojis",
                            description: "The emojis the bot will react with (separated by a comma). Needs to be from this server.",
                            type: "STRING",
                            required: false
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Remove a channel.",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "channel",
                            description: "The channel you want to remove.",
                            type: "CHANNEL",
                            channelTypes: ["GUILD_TEXT"],
                            required: true
                        }
                    ]
                },
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
        const reactsDb = client.db.autoReact

        const action = options.getSubcommand()
        const channel = options.getChannel("channel")
        const emojis = (options.getString("emojis") || "🟢,🔴").trim().replace(/\s+/g, "").split(",")
        
        switch (action) {
            case "add":
                if (await reactsDb.findOne({ guildId: guild.id, channelId: channel.id })) return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Error")
                            .setDescription(`Channel ${channel} is already in the database.`)
                            .setFooter(client.footer)
                            .setColor("RED")
                    ],
                    ephemeral: true
                })

                const newDb = new reactsDb({ guildId: guild.id, channelId: channel.id, emojis })
                await newDb.save()

                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Success")
                            .setDescription(`Channel ${channel} added to the database: now the bot will react with \`${emojis.map(e => e)}\` to every message sent in that channel.`)
                            .setFooter(client.footer)
                            .setColor(client.color)
                    ]
                })
                break

            case "remove":
                if (!(await reactsDb.findOne({ guildId: guild.id, channelId: channel.id }))) return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Error")
                            .setDescription(`Channel ${channel} is not in the database yet.`)
                            .setFooter(client.footer)
                            .setColor("RED")
                    ],
                    ephemeral: true
                })

                await reactsDb.deleteOne({ guildId: guild.id, channelId: channel.id })

                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Success")
                            .setDescription(`Channel ${channel} removed from the database.`)
                            .setFooter(client.footer)
                            .setColor(client.color)
                    ]
                })
                break
        }
    }
}