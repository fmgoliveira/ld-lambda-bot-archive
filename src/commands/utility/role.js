const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "role",
            description: "Add/Remove a user's role.",
            category: "utility",
            usage: "<add/remove> <user> <role>",
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "add",
                    description: "Add a role to a user",
                    options: [
                        {
                            type: "USER",
                            name: "user",
                            description: "The user you want to add the role to",
                            required: true
                        },
                        {
                            type: "ROLE",
                            name: "role",
                            description: "The role you want to add to the user",
                            required: true
                        }
                    ]
                },
                {
                    type: "SUB_COMMAND",
                    name: "remove",
                    description: "Remove a role from a user",
                    options: [
                        {
                            type: "USER",
                            name: "user",
                            description: "The user you want to remove the role from",
                            required: true
                        },
                        {
                            type: "ROLE",
                            name: "role",
                            description: "The role you want to remove from the user",
                            required: true
                        }
                    ]
                }
            ]
        })
    }

    run = async (message) => {
        if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply({
            embeds: [new MessageEmbed()
                .setTitle("Error")
                .setColor("RED")
                .setDescription("You do not have permission to use this command. \n\n> You need the `MANAGE_ROLES` permission to do that.")
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ],
            ephemeral: true
        })

        const subCommand = message.options.getSubcommand()
        
        require(`../../subCommands/role/${subCommand}`)(this.client, message)
    }
}