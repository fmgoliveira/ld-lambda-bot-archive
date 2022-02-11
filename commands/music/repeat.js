const { CommandInteraction, Client, MessageEmbed, WebhookClient, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    name: "repeat",
    description: "Toggle the music repeat mode.",
    category: "music",
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
            const queue = await client.distube.getQueue(VoiceChannel)
            if (!queue) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setColor("RED")
                        .setDescription("There aren't any songs in the queue.")
                        .setFooter(client.footer)
                        .setTimestamp()
                ],
                ephemeral: true
            })

            let mode = await client.distube.setRepeatMode(queue)

            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Repeat Mode Toggled")
                        .setDescription(`Repeat mode has been successfully set to \`${mode = mode ? mode == 2 ? "Queue" : "Song" : "Off"}\`.`)
                        .setColor(client.color)
                        .setTimestamp()
                        .setFooter(client.footer)
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