const { Interaction, Client, MessageEmbed, WebhookClient, MessageActionRow, MessageButton } = require("discord.js")
const { missingClientPermissions, missingUserPermissions } = require("../../utils/embeds/ErrorEmbed")

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.guild.available) return
        if (interaction.member.user.bot) return

        if (["policy-accept", "policy-decline"].includes(interaction.customId)) {
            const buttonId = interaction.customId
            const category = buttonId.split("-")[0]
            const command = buttonId.split("-")[1]

            return require(`../../utils/subEvents/${category}/${command}`)(interaction, client)
        }

        interaction.guild.db = await client.db.guilds.findOne({ guildId: interaction.guild.id }) || new client.db.guilds({ guildId: interaction.guild.id })
        interaction.member.db = await client.db.users.findOne({ userId: interaction.member.id })

        if (!interaction.member.db) {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Privacy Policy")
                        .setDescription("To use our bot, you need to accept our [Privacy Policy](https://wiki.lambdadev.xyz/legal/policy) and [Terms of Service](https://wiki.lambdadev.xyz/legal/terms).\n*This will only be asked until you accept they.*")
                        .setThumbnail(client.user.avatarURL())
                        .setFooter(client.footer)
                        .setColor(client.color)
                ],
                ephemeral: true,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId("policy-accept")
                            .setStyle("SUCCESS")
                            .setLabel("Accept"),
                        new MessageButton()
                            .setCustomId("policy-decline")
                            .setStyle("DANGER")
                            .setLabel("Decline")
                    )
                ]
            })
        } else {
            if (!interaction.member.db.acceptedPolicy) {
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Privacy Policy")
                            .setDescription("To use our bot, you need to accept our [Privacy Policy](https://wiki.lambdadev.xyz/legal/policy) and [Terms of Service](https://wiki.lambdadev.xyz/legal/terms).\n*This will only be asked until you accept they.*")
                            .setThumbnail(client.user.avatarURL())
                            .setFooter(client.footer)
                            .setColor(client.color)
                    ],
                    ephemeral: true,
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setCustomId("policy-accept")
                                .setStyle("SUCCESS")
                                .setLabel("Accept"),
                            new MessageButton()
                                .setCustomId("policy-decline")
                                .setStyle("DANGER")
                                .setLabel("Decline")
                        )
                    ]
                })
            }
        }

        if (interaction.member.db.blacklisted) {
            const errorLogs = new WebhookClient({
                id: process.env.BOT_LOGS_WEBHOOK_ID,
                token: process.env.BOT_LOGS_WEBHOOK_TOKEN,
                url: process.env.BOT_LOGS_WEBHOOK_URL
            })
            errorLogs.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Blacklisted User Action Log")
                        .setColor("RED")
                        .setDescription("A blacklisted user tried to interact with the bot.")
                        .addField("User", `${interaction.member.user.tag} (\`${interaction.member.user.id}\`)`)
                        .addField("Guild", `${interaction.guild.name} (\`${interaction.guild.id}\`)`)
                        .addField("Channel", `<#${interaction.channel.id}> (\`${interaction.channel.id}\`)`)
                        .addField("Command / Context Menu", (interaction.isCommand() || interaction.isContextMenu()) ? interaction.commandName : "Null", true)
                        .addField("Button / Select Menu ID", (interaction.isButton() || interaction.isSelectMenu()) ? interaction.customId : "Null", true)
                        .setFooter(client.footer)
                        .setTimestamp()
                ]
            })

            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Support Required")
                        .setColor("RED")
                        .setTimestamp()
                        .setFooter(client.footer)
                        .setDescription(`**Your account has been blacklisted** from using the bot because of any suspicious behaviour we've noticed coming from it.\n*If you think this is a mistake, please get in contact with the Team at our* ***[Support Server](${process.env.LAMBDA_GUILD_LINK})***.`)
                ],
                ephemeral: true,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setLabel("Support Server")
                            .setStyle("LINK")
                            .setURL(process.env.LAMBDA_GUILD_LINK)
                    )
                ]
            })
        }

        const errorLogs = new WebhookClient({
            id: process.env.ERROR_WEBHOOK_ID,
            token: process.env.ERROR_WEBHOOK_TOKEN,
            url: process.env.ERROR_WEBHOOK_URL
        })

        if (interaction.isCommand() || interaction.isContextMenu()) {
            // await interaction.deferReply({ ephemeral: true })
            const command = client.commands.get(interaction.commandName)
            if (!command) {
                errorLogs.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("A user got an error")
                            .setDescription("A user got an error trying to execute a command.")
                            .addField("Command", `${interaction.commandName}`)
                            .addField("User", `<@${interaction.member.id}> (${interaction.member.user.tag} | \`${interaction.member.id}\`)`)
                            .addField("Guild", `${interaction.guild.name}`)
                            .addField(`Channel`, `<#${interaction.channel.id}>`)
                            .setColor("RED")
                            .setTimestamp(),
                        new MessageEmbed()
                            .setTitle("Error Log")
                            .setDescription("```Command not found```")
                    ]
                })
                client.commands.delete(interaction.commandName)
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setTitle("Error")
                            .setDescription("*An unknown error occurred while trying to run that command.*\nThis incident has been reported to the Team.")
                            .addField("Error Log", "```Command Not Found. Command has been deleted from the system.```")
                            .setFooter(client.footer)
                    ],
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setLabel("Support Server")
                                .setURL(process.env.LAMBDA_GUILD_LINK)
                                .setStyle("LINK")
                        )
                    ]
                })
            }

            const moderator_role = (await client.db.guilds.findOne({ guildId: interaction.guild.id }) || new client.db.guilds({ guildId: interaction.guild.id })).moderation.moderatorRole

            if (command.category === "moderation") {
                if (moderator_role) {
                    if (!interaction.member.roles.cache.has(moderator_role) && interaction.member.id !== process.env.OWNER_ID) return interaction.reply(missingUserPermissions(client, [`MODERATOR ROLE - <@&${moderator_role}>`]))
                } else {
                    let list = []
                    command.userPermissions.forEach(perm => {
                        if (!interaction.member.permissionsIn(interaction.channel).has(perm) && interaction.member.id !== process.env.OWNER_ID) list.push(perm)
                    })
                    if (list.length > 0) {
                        return interaction.reply(missingUserPermissions(client, list))
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

                const color = (await client.db.guilds.findOne({ guildId: interaction.guild.id }) || new client.db.guilds({ guildId: interaction.guild.id })).logging.color.moderation
                const active = (await client.db.guilds.findOne({ guildId: interaction.guild.id }) || new client.db.guilds({ guildId: interaction.guild.id })).logging.active.moderation
                const logChannel = interaction.guild.channels.cache.get((await client.db.guilds.findOne({ guildId: interaction.guild.id }) || new client.db.guilds({ guildId: interaction.guild.id })).logging.channel.moderation)

                if (cmdName === "ban" && active.ban && logChannel && interaction.member.id !== process.env.OWNER_ID) {
                    try {
                        logChannel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Ban Logs")
                                    .setDescription("Someone used the `/ban` command")
                                    .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                    .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                    .addField("Reason", cmdOptions.reason || "No reason specified")
                                    .setTimestamp()
                                    .setColor(color)
                            ]
                        })
                    } catch (err) { console.log(err) }
                }
                if (cmdName === "kick" && active.kick && logChannel && interaction.member.id !== process.env.OWNER_ID) {
                    try {
                        logChannel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Kick Logs")
                                    .setDescription("Someone used the `/kick` command")
                                    .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                    .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                    .addField("Reason", cmdOptions.reason || "No reason specified")
                                    .setTimestamp()
                                    .setColor(color)
                            ]
                        })
                    } catch (err) { console.log(err) }
                }
                if (cmdName === "clear" && active.clear && logChannel && interaction.member.id !== process.env.OWNER_ID) {
                    try {
                        logChannel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Purge Logs")
                                    .setDescription("Someone used the `/clear` command")
                                    .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`)
                                    .addField("Amount of messages", `${cmdOptions.amount}`, true)
                                    .addField("Channel", `<#${interaction.channel.id}>`, true)
                                    .setTimestamp()
                                    .setColor(color)
                            ]
                        })
                    } catch (err) { console.log(err) }
                }
                if (cmdName === "warn" && active.warn && logChannel && interaction.member.id !== process.env.OWNER_ID) {
                    try {
                        logChannel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Warn Logs")
                                    .setDescription("Someone used the `/warn` command")
                                    .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                    .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                    .addField("Reason", cmdOptions.reason || "No reason specified")
                                    .setTimestamp()
                                    .setColor(color)
                            ]
                        })
                    } catch (err) { console.log(err) }
                }
                if (cmdName === "clearwarns" && active.warn && logChannel && interaction.member.id !== process.env.OWNER_ID) {
                    try {
                        logChannel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Clear Warns Logs")
                                    .setDescription("Someone used the `/clearnwarns` command")
                                    .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`, true)
                                    .addField("Target", `@${cmdOptions.user.tag} (\`${cmdOptions.user.id}\`)`, true)
                                    .setTimestamp()
                                    .setColor(color)
                            ]
                        })
                    } catch (err) { console.log(err) }
                }
                if (cmdName === "timeout" && active.timeout && logChannel && interaction.member.id !== process.env.OWNER_ID) {
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
                                    .setTimestamp()
                                    .setColor(color)
                            ]
                        })
                    } catch (err) { console.log(err) }
                }
                if (cmdName === "slowmode" && active.slowmode && logChannel && interaction.member.id !== process.env.OWNER_ID) {
                    try {
                        logChannel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Slowmode Logs")
                                    .setDescription("Someone used the `/timeout` command")
                                    .addField("User", `@${interaction.member.user.tag} (\`${interaction.member.id}\`)`)
                                    .addField("Slowmode (secs)", cmdOptions.seconds, true)
                                    .addField("Channel", `<#${interaction.channel.id}>`, true)
                                    .setTimestamp()
                                    .setColor(color)
                            ]
                        })
                    } catch (err) { console.log(err) }
                }
            }
            if (command.userPermissions && interaction.member.id !== process.env.OWNER_ID && command.category !== "moderation") {
                let list = []
                command.userPermissions.forEach(perm => {
                    if (!interaction.member.permissionsIn(interaction.channel).has(perm)) list.push(perm)
                })
                if (list.length > 0) {
                    return interaction.reply(missingUserPermissions(client, list))
                }
            }

            if (command.botPermissions) {
                let list = []
                command.botPermissions.forEach(perm => {
                    if (!interaction.guild.me.permissionsIn(interaction.channel).has(perm)) list.push(perm)
                })
                if (list.length > 0) {
                    return interaction.reply(missingUserPermissions(client, list))
                }
            }

            if (command.premiumLevel) {
                const memberDb = await client.db.users.findOne({ userId: interaction.member.id })
                if (memberDb) {
                    const amount = memberDb.voteAmount
                    if (!memberDb.voted || amount === 0) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Premium Only Command")
                                .setDescription(`You need to upvote the bot at least \`${command.premiumLevel}\` times to use this command.\n*Check \`/vote\` for more info.*`)
                                .setColor("RED")
                                .setFooter(client.footer)
                        ],
                        ephemeral: true
                    })
                    if (amount < command.premiumLevel) return interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Premium Only Command")
                                .setDescription(`You need to upvote the bot at least \`${command.premiumLevel}\` times to use this command (\`${command.premiumLevel - amount}\` more times).\n*Check \`/vote\` for more info.*`)
                                .setColor("RED")
                                .setFooter(client.footer)
                        ],
                        ephemeral: true
                    })
                }
            }

            try {
                await command.execute(interaction, client)
            } catch (e) {
                console.log(e)
                const errorLogs = new WebhookClient({
                    id: process.env.ERROR_WEBHOOK_ID,
                    token: process.env.ERROR_WEBHOOK_TOKEN,
                    url: process.env.ERROR_WEBHOOK_URL
                })
                errorLogs.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("A user got an error")
                            .setDescription("A user got an error trying to execute a command.")
                            .addField("Command", `${interaction.commandName}`)
                            .addField("User", `<@${interaction.member.id}> (${interaction.member.user.tag} | \`${interaction.member.id}\`)`)
                            .addField("Guild", `${interaction.guild.name}`)
                            .addField(`Channel`, `<#${interaction.channel.id}>`)
                            .setColor("RED")
                            .setTimestamp(),
                        new MessageEmbed()
                            .setTitle("Error Log")
                            .setDescription(`\`\`\`${e.toString().slice(0, 4000)}\`\`\``)
                    ]
                })
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setTitle("Error")
                            .setDescription("*An unknown error occurred while trying to run that command.*\nThis incident has been reported to the Team.")
                            .addField("Error Log", `\`\`\`` + `${e.name}: ${e.message}`.split(0, 1018) + `\`\`\``)
                            .setFooter(client.footer)
                    ],
                    ephemeral: true,
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setLabel("Support Server")
                                .setURL(process.env.LAMBDA_GUILD_LINK)
                                .setStyle("LINK")
                        )
                    ]
                })
            }
        }
    }
}