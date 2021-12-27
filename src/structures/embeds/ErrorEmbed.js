const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

class ErrorEmbed {
    missingUserPermissions(client, permissions) {
        return {
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`You do not have permission to use this command. You need the following permissions to do that:\`\`\`${permissions.join(",")}\`\`\``)
                    .setFooter(client.user.username, client.user.avatarURL())
                    .setTimestamp()
                    .setColor("RED")
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setEmoji("<:logo:921033010764218428>")
                        .setLabel("Support Server")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )
            ]
        }
    }

    missingClientPermissions(client, permissions) {
        return {
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`I do not have permission to run this command. Please contact one of the server's administrators to fix my permissions.`)
                    .setFooter(client.user.username, client.user.avatarURL())
                    .setTimestamp()
                    .setColor("RED")
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setEmoji("<:logo:921033010764218428>")
                        .setLabel("Support Server")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )
            ]
        }
    }
}

module.exports = ErrorEmbed