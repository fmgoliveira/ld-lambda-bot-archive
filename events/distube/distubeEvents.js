const client = require("../../index")
const { MessageEmbed, WebhookClient, MessageButton, MessageActionRow } = require("discord.js")

client.distube
    .on('playSong', (queue, song) =>
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Playing now")
                    .setDescription(`**${song.name}** - \`${song.formattedDuration}\``)
                    .setFooter({ text: `Requested by: ${song.user.tag}`, iconURL: `${song.user.avatarURL()}` })
                    .setTimestamp()
                    .setColor(client.color)
            ]
        })
    )
    .on('addSong', (queue, song) =>
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Added song to queue")
                    .setDescription(`**${song.name}** - \`${song.formattedDuration}\``)
                    .setFooter({ text: `Requested by: ${song.user.tag}`, iconURL: `${song.user.avatarURL()}` })
                    .setTimestamp()
                    .setColor(client.color)
            ]
        })
    )
    .on('addList', (queue, playlist) =>
        queue.textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Added playlist to queue")
                    .setDescription(`**${playlist.name}** (\`${playlist.songs.length} songs\`)`)
                    .setFooter({ text: `Requested by: ${song.user.tag}`, iconURL: `${song.user.avatarURL()}` })
                    .setTimestamp()
                    .setColor(client.color)
            ]
        })
    )
    .on('error', (channel, e) => {
        const errorLogs = new WebhookClient({
            id: process.env.ERROR_WEBHOOK_ID,
            token: process.env.ERROR_WEBHOOK_TOKEN,
            url: process.env.ERROR_WEBHOOK_URL
        })
        errorLogs.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("A user got an error")
                    .setDescription("A user got an error trying to execute a music system action.")
                    .setColor("RED")
                    .setTimestamp(),
                new MessageEmbed()
                    .setTitle("Error Log")
                    .setDescription(`\`\`\`${e.toString().slice(0, 4000)}\`\`\``)
            ]
        })
        channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription("*An unknown error occurred while trying to execute a music system action.*\nThis incident has been reported to the Team.")
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
    })
    .on('empty', queue => queue.textChannel.send({
        embeds: [
            new MessageEmbed()
                .setColor("RED")
                .setTitle("Empty Voice Channel")
                .setDescription("Voice channel is empty. *Leaving the channel...*")
                .setFooter(client.footer)
                .setTimestamp()
        ],
    }))
    .on('searchNoResult', (message, query) =>
        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Error")
                    .setDescription(`No results found for \`${query}\`. Please try again`)
                    .setFooter(client.footer)
            ],
        })
    )
    .on('finish', queue => queue.textChannel.send({
        embeds: [
            new MessageEmbed()
                .setTitle("Finished playing queue")
                .setDescription(`I have no more music to play. Add more songs to the queue with the \`/play\` command.`)
                .setFooter(client.footer)
                .setTimestamp()
                .setColor(client.color)
        ]
    }))