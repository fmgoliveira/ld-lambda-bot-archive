const { MessageEmbed, Message, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")
const fs = require("fs")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "help",
            description: "Get help about all the commands.",
            options: [
                {
                    name: "command",
                    type: "STRING",
                    description: "The command you want to know more about.",
                    required: false
                }
            ],
            category: "general",
            usage: "(command)"
        })
    }

    run = (message) => {
        var commandCommand = message.options.getString("command")

        const directories = [...new Set(this.client.commands.map((cmd) => cmd.category))]

        const formatString = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`

        const categories = directories.map((dir) => {
            const getCommands = this.client.commands.filter((cmd) => cmd.category === dir).map(cmd => {
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

        // console.log(categories)
        if (!commandCommand) {

            const embed = new MessageEmbed()
                .setTitle("Help - Categories")
                .setDescription("These are the command categories for LΛMBDΛ bot. Use `/help <command>` to view all the info about a specific command.")
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
                .setColor("#ffa726")
                .setThumbnail("https://cdn.discordapp.com/attachments/905885763755995176/905886436006432799/logo_bg_orange_text.png")

            for (let category of categories) {
                let counter = category.commands.length
                let cmds = category.commands.map((cmd) => cmd.name)
                let commands = cmds.join(", ")

                embed.addField(`${category.directory} [${counter}]`, commands, true)
            }

            const components = (state) => [
                new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setCustomId("help-menu")
                        .setPlaceholder("Select a category")
                        .setDisabled(state)
                        .addOptions(
                            categories.map((cmd) => {
                                return {
                                    label: cmd.directory,
                                    value: cmd.directory.toLowerCase()
                                }
                            })
                        )
                )
            ]

            const initialMessage = message.reply({ embeds: [embed], components: components(false) })

            const collector = message.channel.createMessageComponentCollector({ componentType: "SELECT_MENU", /*time: 30000*/ })

            collector.on("collect", (interaction) => {
                const [directory] = interaction.values
                const category = categories.find(x => x.directory.toLowerCase() === directory)

                const categoryEmbed = new MessageEmbed()
                    .setTitle(`${formatString(directory)} Category`)
                    .setDescription(`These are the commands in the \`${directory.toUpperCase()}\` category. Use \`/help <command>\` to check the use cases.`)
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                    .setTimestamp()
                    .setColor("#ffa726")
                    .addFields(category.commands.map((cmd) => {
                        return {
                            name: formatString(cmd.name),
                            value: cmd.description,
                            inline: true
                        }
                    }))

                interaction.update({ embeds: [categoryEmbed] })
            })
        } else {
            if (!this.client.commands.map((cmd) => cmd.name).includes(commandCommand)) {
                return message.reply({
                    embeds: [new MessageEmbed()
                        .setTitle("Error")
                        .setDescription("Please inform a valid command.")
                        .setColor("RED")
                        .setTimestamp()
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                    ],
                    ephemeral: true,
                    components: [
                        new MessageActionRow().addComponents(new MessageButton().setEmoji("<:logo:906086580354162698>").setLabel("Join Lambda Group").setStyle("LINK").setURL(process.env.SERVER_LINK))
                    ]
                })
            }

            const command = this.client.commands.filter((cmd) => cmd.name === commandCommand)[0]

            let usage = ""

            if (command.usage) {
                usage = ` ${command.usage}`
            } else {
                usage = ``
            }

            const commandEmbed = new MessageEmbed()
                .setTitle(formatString(command.name))
                .setDescription(command.description)
                .addField("Usage", `\`/${command.name}${usage}\``)
                .setColor("#ffa726")
                .setFooter(`() = Optional, <> = Required\n${this.client.user.username}`, this.client.user.avatarURL())
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.avatarURL())

            return message.reply({embeds: [commandEmbed]})
        }
    }
}