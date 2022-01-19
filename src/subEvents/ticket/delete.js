const { MessageEmbed, MessageActionRow, MessageButton, Util } = require("discord.js")
const fs = require("fs")

module.exports = async (client, interaction, database) => {
    try {
        if (database.tickets.logChannel) {
            interaction.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Ticket Delete")
                        .setDescription("Ticket will be deleted in 5 seconds...")
                        .setFooter("If you want to instantly delete the tickets not using a closed category, set the closed category to 'None' in the dashboard.")
                        .setColor("RED")
                ]
            })

            setTimeout(async () => {
                try {
                    interaction.channel.delete().then(async (ch) => {
                        const ticket = await client.db.tickets.findOne({ id: ch.id })

                        let content = ""
                        ticket.content.forEach(msg => {
                            if (msg.content) content += `**${msg.author.tag}** (\`${msg.author.id}\`) >> ${msg.content}\n`
                        })

                        try {
                            client.channels.cache.get(database.tickets.logChannel).send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Ticket Deleted")
                                        .setDescription(`Ticket \`${ch.id}\` was **deleted** by ${interaction.member.user.tag}.`)
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

                        await client.db.tickets.findOneAndDelete({ id: ch.id })
                    })
                } catch (err) { console.log(err) }
            }, 5000)
        } else {
            interaction.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Ticket Delete")
                        .setDescription("Ticket will be deleted in 5 seconds...")
                        .setFooter("If you want to instantly delete the tickets not using a closed category, set the closed category to 'None' in the dashboard.")
                        .setColor("RED")
                ]
            })
            setTimeout(async () => {
                interaction.channel.delete()
                await client.db.tickets.findOneAndDelete({ id: interaction.channel.id })
            }, 5000)
        }
    } catch {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("Missing permissions. I can't delete a channel in this category or send messages in log channel. Please make sure I can do it and try again.")
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