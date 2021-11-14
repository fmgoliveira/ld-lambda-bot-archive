const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Event = require("../../structures/Event")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "interactionCreate"
        })
    }

    run = async (interaction) => {
        if (interaction.member.user.bot) return

        const interactionUser = await this.client.db.users.findById(interaction.member.user.id) || new this.client.db.users({ _id: interaction.member.user.id })

        if (interactionUser.blacklisted) return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle("Support Required")
                .setColor("RED")
                .setDescription("🔎 We've noticed some suspicious behaviour coming from this account. Please ask for help in our __support server__ to make sure you're not one of the bad guys.")
                .setFooter(this.client.user.username, this.client.user.avatarURL())
                .setTimestamp()
            ],
            ephemeral: true,
            components: [new MessageActionRow().addComponents(
                new MessageButton()
                    .setEmoji("<:logo:906086580354162698>")
                    .setLabel("Support Server")
                    .setURL(process.env.SERVER_LINK)
                    .setStyle("LINK")
            )]
        })

        if (interaction.isCommand()) {
            if (!interaction.guild) return

            const cmd = this.client.commands.find(c => c.name === interaction.commandName)

            if (cmd) {
                if (cmd.requireDatabase) {
                    interaction.guild.db = await this.client.db.guilds.findById(interaction.guild.id) ||
                        new this.client.db.guilds({ _id: interaction.guild.id })
                }
                try {
                    cmd.run(interaction)
                } catch (error) {
                    console.error(error)
                    interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTitle("Error")
                            .setColor("RED")
                            .setDescription("And error occurred while running this command. \n\n> *Please get in contact with our team in our* **support server**.")
                            .setFooter(this.client.user.username, this.client.user.avatarURL())
                            .setTimestamp()
                        ],
                        ephemeral: true,
                        components: [new MessageActionRow().addComponents(
                            new MessageButton()
                                .setEmoji("<:logo:906086580354162698>")
                                .setLabel("Join Lambda Group")
                                .setURL(process.env.SERVER_LINK)
                                .setStyle("LINK")
                        )]
                    })
                }
            }
        }

        // ? TICKETS MODULE ? //
        if (interaction.isButton()) {
            if (!interaction.guild) return
            
            const buttonId = interaction.customId
            const _category = buttonId.split("-")[0]
            const _command = buttonId.split("-")[1]

            if (["reply"].includes(_category)) return

            const database = await this.client.db.guilds.findById(interaction.guild.id) || new this.client.db.guilds({ _id: interaction.guild.id })
            
            require(`../${_category}/${_command}`)(this.client, interaction, database)
        }
    }
}