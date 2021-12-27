const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")
const Event = require("../../structures/Event")
const inviteButton = require("../../structures/components/inviteButton")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "interactionCreate"
        })
    }

    run = async (interaction) => {
        if (interaction.member.user.bot) return
        if (!interaction.guild) return
        if (!interaction.guild.available) return interaction.reply({ content: "❌ This guild is not available due to possible discord outage." , ephemeral: true})
        if (interaction.isSelectMenu()) return

        const interactionUser = await this.client.db.users.findById(interaction.member.user.id) || new this.client.db.users({ _id: interaction.member.user.id })

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
            components: [ new inviteButton() ]
        })

        if (interaction.isCommand()) {
            const command = this.client.commands.find(cmd => cmd.name === interaction.commandName)

            if (command) {
                if (command.requireDatabase) {
                    interaction.guild.db = await this.client.db.guilds.findById(interaction.guild.id) ||
                        new this.client.db.guilds({ _id: interaction.guild.id })
                }
                if (command.category === "moderation") {
                    const moderator_role = (await this.client.db.guilds.findById(interaction.guild.id)).moderation?.moderator_role
                    
                    let plist = []
                    command.permissions.forEach(perm => {
                        if (!interaction.guild.members.cache.get(this.client.user.id).permissions.has(perm))
                        plist.push(perm)
                    })
                    if (plist.length > 0) {
                        return interaction.reply(ErrorEmbed.missingClientPermissions(this.client, plist))
                    }

                    if (moderator_role) {
                        if (!interaction.member.roles.has(moderator_role)) return interaction.reply(ErrorEmbed.missingUserPermissions(this.client, ["Moderator Role"]))
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
                }
                if (command.permissions && command.category !== "moderation") {
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
                            components: [ new inviteButton() ]
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

            const database = await this.client.db.guilds.findById(interaction.guild.id) || new this.client.db.guilds({ _id: interaction.guild.id })

            require(`../../subEvents/${_category}/${_command}`)(this.client, interaction, database)
        }
    }   
}