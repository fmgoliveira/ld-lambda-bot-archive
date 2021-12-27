const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "panel",
            description: "Configure ticket panel.",
            category: "tickets",
            usage: "<add|remove|find|edit|toggle>",
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
            ],
            permissions: [ "MANAGE_GUILD" ]
        })
    }

    run = async (message) => {
        const subCommand = message.options.getSubcommand()
        let subCommandGroup
        try {
            subCommandGroup = message.options.getSubcommandGroup()
        } catch (error) {
            if (error.type === TypeError) subCommandGroup = undefined
        }

        if (!subCommandGroup) require(`../../subCommands/tickets/panel/${subCommand}`)(this.client, message)
        else require(`../../subCommands/tickets/panel/${subCommandGroup}/${subCommand}`)(this.client, message)
    }
}