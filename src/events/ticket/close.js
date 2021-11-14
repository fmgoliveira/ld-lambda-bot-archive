const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js")

module.exports = (client, interaction, database) => {
    let collector

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
            interaction.channel.delete()
            interaction.deferUpdate()
        } catch {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setDescription("Missing permissions. I can't delete a channel in this category. Please make sure I can do it and try again.")
                        .setColor("RED")
                        .setTimestamp()
                        .setFooter(client.user.username, client.user.avatarURL())
                ],
                ephemeral: true,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setEmoji("<:logo:906086580354162698>")
                            .setLabel("Join Lambda Group")
                            .setURL(process.env.SERVER_LINK)
                            .setStyle("LINK")
                    )
                ]
            })
        }
    } else {
        try {
            interaction.channel.setParent(interaction.guild.channels.cache.get(database.tickets.closed_category))
            interaction.channel.setName(`closed-${interaction.channel.name.split("-")[1]}`)
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
                            .setEmoji("<:logo:906086580354162698>")
                            .setLabel("Join Lambda Group")
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