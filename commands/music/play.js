const { CommandInteraction, Client, MessageEmbed, WebhookClient, MessageActionRow, MessageButton } = require("discord.js")
const { joinVoiceChannel } = require("@discordjs/voice")

module.exports = {
    name: "play",
    description: "Play a song.",
    category: "music",
    options: [
        {
            name: "query",
            description: "Name or url for the song.",
            type: "STRING",
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
            joinVoiceChannel({
               channelId: VoiceChannel.id,
               guildId: guild.id,
               adapterCreator: guild.voiceAdapterCreator
            })
            client.distube.play(VoiceChannel, interaction.options.getString("query"), { textChannel: channel, member })
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Request received")
                        .setDescription("The song you've requested has been added to the queue.")
                        .setColor(client.color)
                        .setFooter(client.footer)
                        .setTimestamp()
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
