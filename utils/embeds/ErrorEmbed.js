const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")

module.exports = {
    missingUserPermissions(client, permissions) {
        return {
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`You do not have permission to use this command. You need the following permissions to do that:\`\`\`${permissions.join(",")}\`\`\``)
                    .setFooter(client.footer)
                    .setTimestamp()
                    .setColor("RED")
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("Support Server")
                        .setURL(process.env.LAMBDA_GUILD_LINK)
                        .setStyle("LINK")
                )
            ]
        }
    },

    missingClientPermissions(client, permissions) {
        return {
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`I do not have permission to use this command. Please contact one of the server's administrators to fix my permissions. I need the following permissions to run that command:\`\`\`${permissions.join(",")}\`\`\``)
                    .setFooter(client.footer)
                    .setTimestamp()
                    .setColor("RED")
            ],
            ephemeral: true,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("Support Server")
                        .setURL(process.env.LAMBDA_GUILD_LINK)
                        .setStyle("LINK")
                )
            ]
        }
    }
}