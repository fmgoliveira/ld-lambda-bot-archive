const { CommandInteraction, Client, MessageEmbed, WebhookClient, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "volume",
    description: "Change the volume.",
    category: "music",
    options: [
        {
            name: "percentage",
            description: "10 = 10%.",
            type: "NUMBER",
            minValue: "1",
            maxValue: "200",
            required: true
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const { member, guild, channel } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setColor("RED")
                    .setDescription("You should join a voice channel to use the music module.")
                    .setTimestamp()
                    .setFooter(client.footer)
            ],
            ephemeral: true
        })

        if (guild.me.voice.channelId && VoiceChannel.id !== guild.me.voice.channelId) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setColor("RED")
                    .setDescription(`I'm already playing music in <#${guild.me.voice.channelId}>.`)
                    .setTimestamp()
                    .setFooter(client.footer)
            ],
            ephemeral: true
        })

        try {
            const volume = interaction.options.getNumber("percentage")
            client.distube.setVolume(VoiceChannel, volume)
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Volume Changed")
                        .setDescription(`The volume has been successfully changed to \`${volume}%\``)
                        .setFooter(client.footer)
                        .setTimestamp()
                        .setColor(client.color)
                ]
            })
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
    }
}