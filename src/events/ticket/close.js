const { MessageEmbed, MessageActionRow, MessageButton, Permissions, MessageAttachment } = require("discord.js")
const fs = require("fs")

module.exports = (client, interaction, database) => {
    // let collector

    // interaction.followUp(interaction.channel.send({
    //     embeds: [
    //         new MessageEmbed()
    //             .setTitle("Close Ticket")
    //             .setDescription("Are you sure you want to close this ticket?")
    //             .setColor("#fff59d")
    //     ],
    //     components: [
    //         new MessageActionRow().addComponents(
    //             new MessageButton()
    //                 .setEmoji("<:greencheck:758380151544217670>")
    //                 .setLabel("Yes")
    //                 .setCustomId("reply-yes")
    //                 .setStyle("SUCCESS"),
    //             new MessageButton()
    //                 .setEmoji("<:redcross:758380151238033419>")
    //                 .setLabel("No")
    //                 .setCustomId("reply-no")
    //                 .setStyle("DANGER")
    //         )
    //     ],
    //     fetchReply: true
    // }).then((msg) => {
    //     collector = msg.createMessageComponentCollector()

    //     collector.on("collect", i => {
    //         if (i.customId === "reply-yes") {
    //             i.deferUpdate()


    if (!database.tickets.closed_category) {
        try {
            if (database.tickets.log_channel) {
                // const channelId = interaction.channel.id

                interaction.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Ticket Delete")
                            .setDescription("Ticket will be deleted in 5 seconds...")
                            .setFooter("If you want to move the tickets to a closed category, please set it first using `/config tickets closed_category`.")
                            .setColor("RED")
                    ]
                })

                setTimeout(async () => {
                    try {
                        interaction.channel.delete().then((ch) => {
                            client.db.transcripts.findById(ch.id, async (err, data) => {
                                if (err) console.log(err)
                                if (data) {
                                    let content = ""
                                    data.content.forEach(msg => {
                                        if (msg.content) content += `**${msg.author.tag}** (\`${msg.author.id}\`) >> ${msg.content}\n`
                                    })

                                    // fs.writeFileSync(`src/temp/${ch.id}.txt`, content)

                                    try {
                                        client.channels.cache.get(database.tickets.log_channel).send({
                                            embeds: [
                                                new MessageEmbed()
                                                    .setTitle("Ticket Deleted")
                                                    .setDescription(`Ticket \`${ch.id}\` was **deleted** (closed category not set) by ${interaction.member.user.tag}.`)
                                                    .setFooter(client.user.username, client.user.avatarURL())
                                                    .setTimestamp()
                                                    .setColor("RED"),
                                                new MessageEmbed()
                                                    .setTitle("Ticket Transcript")
                                                    .setDescription(content)
                                                    .setFooter(client.user.username, client.user.avatarURL())
                                                    .setTimestamp()
                                                    .setColor("BLACK")
                                            ]
                                        })
                                    } catch (err) {
                                        console.log(err)
                                    }

                                    // await client.channels.cache.get(database.tickets.log_channel).send({files: [`./src/temp/${ch.id}.txt`]})

                                    client.db.transcripts.findOneAndDelete({ _id: ch.id })
                                    // fs.unlink(`src/temp/${ch.id}.txt`, (err) => { if (err) console.log(err) })
                                }
                            })
                        })
                    } catch (err) { console.log(err) }
                }, 5000)
            }
        } catch {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setDescription("Missing permissions. I can't delete a channel in this category or I can't send messages in log channel. Please make sure I can do it and try again.")
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
        }
    } else {
        try {
            interaction.channel.lockPermissions()
            interaction.channel.setParent(interaction.guild.channels.cache.get(database.tickets.closed_category))
            interaction.channel.setName(`closed-${interaction.channel.name.split("-")[1]}`)

            if (database.tickets.log_channel) {
                try {
                    client.channels.cache.get(database.tickets.log_channel).send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Ticket Closed")
                                .setDescription(`Ticket \`${ch.id}\` was **closed** by ${interaction.member.user.tag}.`)
                                .setFooter(client.user.username, client.user.avatarURL())
                                .setTimestamp()
                                .setColor("RED")
                        ]
                    })
                } catch (err) {
                    console.log(err)
                }
            }

            interaction.update({
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setEmoji("🗑️")
                            .setLabel("Delete Ticket")
                            .setCustomId("ticket-delete")
                            .setStyle("DANGER")
                    )
                ]
            })
        } catch (err) {
            console.log(err)
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setDescription("Missing permissions. I can't move and/or rename a channel in this category or in the closed category. Please make sure I can do it and try again.")
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
        }
    }


    //         } else if (i.customId === "reply-no") {
    //             i.deferUpdate(i.message.delete())
    //         }
    //     })
    // }))
}