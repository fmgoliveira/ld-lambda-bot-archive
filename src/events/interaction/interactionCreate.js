const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")
const Event = require("../../structures/Event")
const inviteButton = require("../../structures/components/inviteButton")
const ErrorEmbed = require("../../structures/embeds/ErrorEmbed")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "interactionCreate"
        })
    }

    run = async (interaction) => {
        if (interaction.member.user.bot) return
        if (!interaction.guild) return
        if (!interaction.guild.available) return interaction.reply({ content: "❌ This guild is not available due to possible discord outage.", ephemeral: true })
        if (interaction.isSelectMenu()) return

        const interactionUser = await this.client.db.users.findOne({ userId: interaction.member.user.id }) || new this.client.db.users({ userId: interaction.member.user.id })

        if (interactionUser.blacklisted) return this.client.channels.cache.get(process.env.LAMBDA_GUILD_LOGS).send({
            embeds: [new MessageEmbed()
                .setTitle("Blacklisted User")
                .setColor("RED")
                .setDescription("A blacklisted user tried to interact with the bot.")
                .addField("User", `${interaction.member.user.tag} (\`${interaction.member.user.id}\`)`)
                .addField("Guild", `${interaction.guild.name} (\`${interaction.guild.id}\`)`)
                .addField("Channel", `<#${interaction.channel.id}> (\`${interaction.channel.id}\`)`)
                .addField("Command/Button ID", interaction.isCommand() ? interaction.commandName : interaction.customId)
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ]
        }) && interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle("Support Required")
                .setColor("RED")
                .setDescription("🔎 We've noticed some suspicious behaviour coming from this account. Please ask for help in our __support server__ to make sure you're not one of the bad guys.")
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ],
            ephemeral: true,
            components: [new inviteButton()]
        })

        if (interaction.isCommand()) {
            const command = this.client.commands.find(cmd => cmd.name === interaction.commandName)

            if (command) {
                if (command.requireDatabase) {
                    interaction.guild.db = await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })
                } else {
                    interaction.guild.db = await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })
                }
                if (command.category === "moderation") {
                    const moderator_role = (await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })).moderation.moderatorRole

                    let plist = []
                    command.permissions.forEach(perm => {
                        if (!interaction.guild.members.cache.get(this.client.user.id).permissions.has(perm))
                            plist.push(perm)
                    })
                    if (plist.length > 0) {
                        return interaction.reply(ErrorEmbed.missingClientPermissions(this.client, plist))
                    }

                    if (moderator_role) {
                        if (!interaction.member.roles.cache.has(moderator_role)) return interaction.reply(ErrorEmbed.missingUserPermissions(this.client, ["Moderator Role"]))
                    }
                    else {
                        let list = []
                        command.permissions.forEach(perm => {
                            if (!interaction.member.permissions.has(perm))
                                list.push(perm)
                        })
                        if (list.length > 0) {
                            return interaction.reply(ErrorEmbed.missingUserPermissions(this.client, list))
                        }
                    }

                    const cmdName = command.name
                    const cmdOptions = {
                        user: interaction.options.getUser("user"),
                        reason: interaction.options.getString("reason"),
                        amount: interaction.options.getNumber("amount"),
                        user: interaction.options.getUser("user"),
                        seconds: interaction.options.getNumber("seconds"),
                        duration: interaction.options.getString("duration")
                    }

                    const color = (await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })).logging.color.moderation
                    const active = (await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })).logging.active.moderation
                    const logChannel = interaction.guild.channels.cache.get((await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })).logging.channel.moderation)

                    if (cmdName === "ban" && active.ban && logChannel) {
                        try {
                            logChannel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Ban Logs")
                                        .setDescription("Someone used the `/ban` command")
                                        .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                        .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                        .addField("Reason", cmdOptions.reason || "No reason specified")
                                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                                        .setTimestamp()
                                        .setColor(color)
                                ]
                            })
                        } catch (err) { console.log(err) }
                    }
                    if (cmdName === "kick" && active.kick && logChannel) {
                        try {
                            logChannel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Kick Logs")
                                        .setDescription("Someone used the `/kick` command")
                                        .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                        .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                        .addField("Reason", cmdOptions.reason || "No reason specified")
                                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                                        .setTimestamp()
                                        .setColor(color)
                                ]
                            })
                        } catch (err) { console.log(err) }
                    }
                    if (cmdName === "clear" && active.clear && logChannel) {
                        try {
                            logChannel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Purge Logs")
                                        .setDescription("Someone used the `/clear` command")
                                        .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`)
                                        .addField("Amount of messages", `${cmdOptions.amount}`, true)
                                        .addField("Channel", `<#${interaction.channel.id}>`, true)
                                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                                        .setTimestamp()
                                        .setColor(color)
                                ]
                            })
                        } catch (err) { console.log(err) }
                    }
                    if (cmdName === "warn" && active.warn && logChannel) {
                        try {
                            logChannel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Warn Logs")
                                        .setDescription("Someone used the `/warn` command")
                                        .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                        .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                        .addField("Reason", cmdOptions.reason || "No reason specified")
                                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                                        .setTimestamp()
                                        .setColor(color)
                                ]
                            })
                        } catch (err) { console.log(err) }
                    }
                    if (cmdName === "clearwarns" && active.warn && logChannel) {
                        try {
                            logChannel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Clear Warns Logs")
                                        .setDescription("Someone used the `/clearnwarns` command")
                                        .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                        .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                                        .setTimestamp()
                                        .setColor(color)
                                ]
                            })
                        } catch (err) { console.log(err) }
                    }
                    if (cmdName === "timeout" && active.timeout && logChannel) {
                        try {
                            logChannel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Timeout Logs")
                                        .setDescription("Someone used the `/timeout` command")
                                        .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                        .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                        .addField("Reason", cmdOptions.reason || "No reason specified")
                                        .addField("Duration", cmdOptions.duration || "No duration specified")
                                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                                        .setTimestamp()
                                        .setColor(color)
                                ]
                            })
                        } catch (err) { console.log(err) }
                    }
                    if (cmdName === "slowmode" && active.slowmode && logChannel) {
                        try {
                            logChannel.send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Slowmode Logs")
                                        .setDescription("Someone used the `/timeout` command")
                                        .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`)
                                        .addField("Slowmode (secs)", cmdOptions.seconds, true)
                                        .addField("Channel", `<#${interaction.channel.id}>`, true)
                                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                                        .setTimestamp()
                                        .setColor(color)
                                ]
                            })
                        } catch (err) { console.log(err) }
                    }
                }
                if (command.category === "tickets") {
                    interaction.guild.ticketPanels = await this.client.db.ticketPanels.find({ guildId: interaction.guild.id })
                    interaction.guild.db = await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })

                    if (!interaction.guild.db.tickets.active) return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTitle("Error")
                            .setColor("RED")
                            .setDescription("Tickets module is not enabled. Please enable it first in the [dashboard](https://bot.lambdadev.xyz/dashboard).")
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    if (interaction.guild.ticketPanels.length === 0) return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTitle("Error")
                            .setColor("RED")
                            .setDescription("There aren't any ticket categories created yet. Please set them first in the [dashboard](https://bot.lambdadev.xyz/dashboard).")
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    let categoryList = []
                    interaction.guild.ticketPanels.forEach(panel => {
                        categoryList.push(panel.category)
                    })

                    if (categoryList.length === 0) return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTitle("Error")
                            .setColor("RED")
                            .setDescription("There aren't any ticket categories created yet. Please set them first in the [dashboard](https://bot.lambdadev.xyz/dashboard).")
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    const tickets = await this.client.db.tickets.find({ guildId: interaction.guild.id })

                    if (!tickets.includes(interaction.channel.id)) return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTitle("Error")
                            .setColor("RED")
                            .setDescription("You can only use this command in a ticket channel.")
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    const ticket = await this.client.db.tickets.findOne({ id: interaction.channel.id })
                    if (!ticket) return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTitle("Error")
                            .setColor("RED")
                            .setDescription("You can only use this command in a ticket channel.")
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    const ticketPanel = this.client.db.ticketPanels.find({ _id: ticket.category })
                    if (!ticketPanel) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Error")
                                .setDescription("There was an error when trying to create a ticket in that category. Please check with the server admins if the panels are fully configurated in the [dashboard](https://bot.lambdadev.xyz/dashboard).")
                                .setColor("RED")
                                .setTimestamp()
                                .setFooter(client.user.username, client.user.avatarURL())
                        ],
                        ephemeral: true,
                        components: [
                            new MessageActionRow().addComponents(
                                new MessageButton()
                                    .setEmoji("<:logo:921033010764218428>")
                                    .setLabel("Join Lambda Development")
                                    .setURL(process.env.SERVER_LINK)
                                    .setStyle("LINK")
                            )
                        ]
                    })

                    if (!interaction.member.roles.cache.has(ticketPanel.supportRole)) return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTitle("Error")
                            .setColor("RED")
                            .setDescription("You do not have permission to use this command.")
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                        ],
                        ephemeral: true
                    })
                }

                if (command.permissions && command.category !== "moderation" && command.category !== "tickets") {
                    let list = []
                    command.permissions.forEach(perm => {
                        if (!interaction.member.permissions.has(perm))
                            list.push(perm)
                    })
                    if (list.length > 0) {
                        return interaction.reply(ErrorEmbed.missingUserPermissions(this.client, list))
                    }
                }
                try {
                    command.run(interaction)
                } catch (error) {
                    try {
                        interaction.reply({
                            embeds: [new MessageEmbed()
                                .setTitle("Error")
                                .setColor("RED")
                                .setDescription("And error occurred while running this command. \n\n> *Please get in contact with our team in our **support server**.")
                                .setFooter(this.client.user.username, this.client.user.avatarURL())
                                .setTimestamp()
                            ],
                            ephemeral: true,
                            components: [new inviteButton()]
                        })
                    } finally {
                        console.error(error)
                        this.client.channels.cache.get(process.env.LAMBDA_GUILD_LOGS).send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Error")
                                    .setColor("RED")
                                    .setDescription("An user got an error trying to execute a command.")
                                    .addField("Command", command.name)
                                    .addField("User", `${interaction.member.user.tag} (\`${interaction.member.user.id}\`)`)
                                    .addField("Guild", `${interaction.guild.name} (\`${interaction.guild.id}\`)`)
                                    .addField("Channel", `<#${interaction.channel.id}> (\`${interaction.channel.id}\`)`)
                                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                                    .setTimestamp(),
                                new MessageEmbed()
                                    .setTitle("Error Log")
                                    .setDescription(`\`\`\`${error}\`\`\``)
                            ]
                        })
                    }
                }
            }
        }

        if (interaction.isButton()) {
            if (!interaction.guild) return interaction.deferUpdate()

            const buttonId = interaction.customId
            const _category = buttonId.split("-")[0]
            const _command = buttonId.split("-")[1]

            if (_command === "main") return

            const database = await this.client.db.guilds.findOne({ guildId: interaction.guild.id }) || new this.client.db.guilds({ guildId: interaction.guild.id })

            require(`../../subEvents/${_category}/${_command}`)(this.client, interaction, database)
        }
    }
}