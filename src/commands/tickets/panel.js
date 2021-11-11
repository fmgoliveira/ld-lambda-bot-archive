const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "panel",
            description: "Configure ticket panel.",
            category: "tickets",
            requireDatabase: true,
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "add",
                    description: "Add a ticket panel"
                },
                {
                    type: "SUB_COMMAND",
                    name: "remove",
                    description: "Remove the ticket panel"
                },
                {
                    type: "SUB_COMMAND",
                    name: "find",
                    description: "Find your ticket panel"
                },
                {
                    type: "SUB_COMMAND",
                    name: "toggle",
                    description: "Toggle the ticket panel status"
                },
                {
                    type: "SUB_COMMAND_GROUP",
                    name: "edit",
                    description: "Edit the ticket panel",
                    options: [
                        {
                            type: "SUB_COMMAND",
                            name: "title",
                            description: "Change the title of the ticket panel",
                            options: [
                                {
                                    type: "STRING",
                                    name: "title",
                                    description: "Change the title of the ticket panel",
                                    required: true
                                }
                            ]
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "description",
                            description: "Change the description of the ticket panel",
                            options: [
                                {
                                    type: "STRING",
                                    name: "description",
                                    description: "Change the description of the ticket panel",
                                    required: true
                                }
                            ]
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "colour",
                            description: "Change the colour of the ticket panel",
                            options: [
                                {
                                    type: "STRING",
                                    name: "colour",
                                    description: "Change the colour of the ticket panel",
                                    required: true
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    }

    run = async (message) => {
        if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setColor("RED")
                .setDescription("You do not have permission to use this command. \n\n> You need the `MANAGE_GUILD` permission to do that.")
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ],
            ephemeral: true
        })

        const subCommand = message.options.getSubcommand()
        let subCommandGroup
        try {
            subCommandGroup = message.options.getSubcommandGroup()
        } catch (error) {
            if (error.type === TypeError) console.log("No subcommand")
            subCommandGroup = undefined
        }

        if (!subCommandGroup) require(`../../subCommands/tickets/panel/${subCommand}`)(this.client, message)
        else require(`../../subCommands/tickets/panel/${subCommandGroup}/${subCommand}`)(this.client, message)
    }
}