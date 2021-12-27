const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, Message } = require("discord.js")
const Command = require("../../structures/Command")
const ErrorEmbed = require("../../structures/embeds/ErrorEmbed")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "config",
            description: "Configure the bot in your server.",
            category: "config",
            requireDatabase: true,
            permisions: [ "MANAGE_GUILD" ],
            usage: "<category> <item> <value> reset",
            options: [
                {
                    type: "SUB_COMMAND_GROUP",
                    name: "reset",
                    description: "Reset any configuration.",
                    options: [
                        {
                            type: "SUB_COMMAND",
                            name: "welcome_channel",
                            description: "Text channel where the welcome message will be sent."
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "welcome_role",
                            description: "The role that will be assigned to a member when they join the server."
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "welcome_message",
                            description: "The message that will be sent in the welcome channel when a member joins the server."
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "moderation_role",
                            description: "Role that allows users to use moderator commands."
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "tickets_log_channel",
                            description: "Channel where ticket creations and deletions will be sent to."
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "tickets_support_role",
                            description: "Role that will be pinged when a new ticket is opened."
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "tickets_category",
                            description: "Category where tickets will be created."
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "tickets_closed_category",
                            description: "Category where tickets will be moved to when they are closed."
                        }
                    ]
                },
                {
                    type: "SUB_COMMAND_GROUP",
                    name: "welcome",
                    description: "Welcome system configuration.",
                    options: [
                        {
                            type: "SUB_COMMAND",
                            name: "channel",
                            description: "Configure the channel where the welcome message will be sent.",
                            options: [
                                {
                                    type: "CHANNEL",
                                    name: "channel",
                                    description: "Text channel where the welcome message will be sent.",
                                    required: true
                                }
                            ]
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "role",
                            description: "Configure the role that will be assigned to a member when they join the server.",
                            options: [
                                {
                                    type: "ROLE",
                                    name: "role",
                                    description: "The role that will be assigned to a member when they join the server.",
                                    required: true
                                }
                            ]
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "message",
                            description: "Configure the message that will be sent in the welcome channel when a member joins the server.",
                            options: [
                                {
                                    type: "STRING",
                                    name: "message",
                                    description: "Available placeholders: {username}, {usermention}, {usertag}, {userid}",
                                    required: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "SUB_COMMAND_GROUP",
                    name: "moderation",
                    description: "Moderation system configuration.",
                    options: [
                        {
                            type: "SUB_COMMAND",
                            name: "moderator_role",
                            description: "Configure the role that allows users to use moderator commands.",
                            options: [
                                {
                                    type: "ROLE",
                                    name: "moderator_role",
                                    description: "Role that allows users to use moderator commands.",
                                    required: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "SUB_COMMAND_GROUP",
                    name: "tickets",
                    description: "Ticket system configuration.",
                    options: [
                        {
                            type: "SUB_COMMAND",
                            name: "log_channel",
                            description: "Configure the channel where ticket creations and deletions will be sent to.",
                            options: [
                                {
                                    type: "CHANNEL",
                                    name: "log_channel",
                                    description: "Channel where ticket creations and deletions will be sent to.",
                                    required: true
                                }
                            ]
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "support_role",
                            description: "Configure the support role that will be pinged when a new ticket is opened.",
                            options: [
                                {
                                    type: "ROLE",
                                    name: "support_role",
                                    description: "Role that will be pinged when a new ticket is opened.",
                                    required: true
                                }
                            ]
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "category",
                            description: "Configure the category where tickets will be created. This category can be renamed/moved.",
                            options: [
                                {
                                    type: "CHANNEL",
                                    name: "category",
                                    description: "Category where tickets will be created.",
                                    required: true
                                }
                            ]
                        },
                        {
                            type: "SUB_COMMAND",
                            name: "closed_category",
                            description: "Set the category where tickets will be moved to when closed. This category can be renamed/moved.",
                            options: [
                                {
                                    type: "CHANNEL",
                                    name: "closed_category",
                                    description: "Category where tickets will be moved to when they are closed.",
                                    required: true
                                }
                            ]
                        },
                    ]
                }
            ]
        })
    }

    run = async (message) => {

        const subCommandGroup = message.options.getSubcommandGroup()
        const subCommand = message.options.getSubcommand()

        require(`../../subCommands/config/${subCommandGroup}/${subCommand}`)(this.client, message)
    }
}