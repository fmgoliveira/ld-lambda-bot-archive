const { CommandInteraction, Client, MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports = {
    name: "help",
    description: "Get help about all the commands.",
    category: "about",
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const directories = [...new Set(client.commands.filter(cmd => !cmd.context).map((cmd) => cmd.category))]

        const formatString = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`

        const categories = directories.map((dir) => {
            const getCommands = client.commands.filter((cmd) => cmd.category === dir).map(cmd => {
                return {
                    name: cmd.name ? cmd.name : "There isn't any name for this command",
                    description: cmd.description ? cmd.description : "There isn't any description for this command",
                    usage: cmd.usage ? cmd.usage : ""
                }
            })

            return {
                directory: formatString(dir),
                commands: getCommands
            }
        })

        const embed = new MessageEmbed()
            .setTitle("Help - Categories")
            .setDescription("These are all the commands for Lambda. Use `/help <command>` to view all the info about a specific command or choose the category from the dropdown menu below.")
            .setFooter(client.footer)
            .setTimestamp()
            .setColor(client.color)
            .setThumbnail(client.user.avatarURL())

        for (let category of categories) {
            let cmds = category.commands.map((cmd) => cmd.name)
            let commands = cmds.join("; ")

            embed.addField(`${category.directory}`, commands, true)
        }
        embed.addField("Links zone", `[Invite me](https://bot.lambdadev.xyz/invite) • [Support Server](${process.env.LAMBDA_GUILD_LINK}) • [Dashboard](https://bot.lambdadev.xyz/dashboard) • [Upvote](https://discord.com/channels/878935240377241701/936677696300253204/937720075320979516)`)

        const components = (state) => [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId("help-menu")
                    .setPlaceholder("Select a category")
                    .setDisabled(state)
                    .addOptions(
                        {
                            label: "None",
                            value: "main"
                        },
                        categories.map((cmd) => {
                            return {
                                label: cmd.directory,
                                value: cmd.directory.toLowerCase()
                            }
                        })
                    )
            )
        ]

        const initialMessage = await interaction.reply({ embeds: [embed], components: components(false), fetchReply: true })

        const collector = initialMessage.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.member.id, componentType: "SELECT_MENU", time: 30000 })

        collector.on("collect", (i) => {
            if (i.values[0] === 'main') {
                const categoryEmbed = new MessageEmbed()
                    .setTitle("Help - Categories")
                    .setDescription("These are all the commands for Lambda. Use `/help <command>` to view all the info about a specific command or choose the category from the dropdown menu below.")
                    .setFooter(client.footer)
                    .setTimestamp()
                    .setColor(client.color)
                    .setThumbnail(client.user.avatarURL())

                for (let category of categories) {
                    let cmds = category.commands.map((cmd) => cmd.name)
                    let commands = cmds.join("; ")

                    categoryEmbed.addField(`${category.directory}`, commands, true)
                }
                categoryEmbed.addField("Links zone", `[Invite me](https://bot.lambdadev.xyz/invite) • [Support Server](${process.env.LAMBDA_GUILD_LINK}) • [Dashboard](https://bot.lambdadev.xyz/dashboard) • [Upvote](https://discord.com/channels/878935240377241701/936677696300253204/937720075320979516)`)

                return i.update({ embeds: [categoryEmbed] })
            } else {
                const [directory] = i.values
                const category = categories.find(x => x.directory.toLowerCase() === directory)

                const categoryEmbed = new MessageEmbed()
                    .setTitle(`${formatString(directory)} Category`)
                    .setDescription(`The commands listed below are the commands from \`${directory.toUpperCase()}\` category. Use \`/help <command>\` to see some info about the command.`)
                    .setFooter(client.footer)
                    .setTimestamp()
                    .setColor(client.color)
                    .addFields(category.commands.map((cmd) => {
                        return {
                            name: formatString(cmd.name),
                            value: cmd.description,
                            inline: true
                        }
                    }))

                return i.update({ embeds: [categoryEmbed] })
            }
        })

        collector.on("end", () => {
            initialMessage.edit({ components: components(true) })
        })
    }
}