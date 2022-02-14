const { MessageEmbed, GuildMember, Client } = require("discord.js")
const placeholderReplace = require("../../utils/placeholderReplace")

module.exports = {
    name: "guildMemberRemove",
    /**
     * 
     * @param {GuildMember} member 
     * @param {Client} client 
     */
    async execute(member, client) {
        const settings = await client.db.guilds.findOne({ guildId: member.guild.id }) || new client.db.guilds({ guildId: member.guild.id })
        const leave = settings.leave

        if (settings.logging.channel.memberEvents) {
            if (settings.logging.active.memberEvents.memberLeave) {
                try {
                    member.guild.channels.cache.get(settings.logging.channel.memberEvents).send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Member left")
                                .setDescription(`A member left the server: ${member.user.tag} (<@${member.id}> \`${member.id}\`)`)
                                .setColor(settings.logging.color.memberEvents)
                                .setTimestamp()
                        ]
                    })
                } catch (err) { console.log(err) }
            }
        }

        client.updateStatus(client)

        if (!leave.active) return

        let message

        if (leave.embed.active) {
            let { author, authorAvatar, authorUrl, title, titleUrl, description, thumbnail, image, footerText, footerIcon, color } = leave.embed

            author = placeholderReplace(author, member.guild, member.user)
            description = placeholderReplace(description, member.guild, member.user)
            footerText = placeholderReplace(footerText, member.guild, member.user)

            const embed = new MessageEmbed()
                .setTitle(title)
                .setColor(color)
                .setDescription(description)

            if (author) {
                embed.setAuthor({ name: author, iconURL: authorAvatar, url: authorUrl })
            }
            if (titleUrl) {
                embed.setURL(titleUrl)
            }
            if (thumbnail) {
                embed.setThumbnail(thumbnail)
            }
            if (image) {
                embed.setImage(image)
            }
            if (footerText) {
                embed.setFooter({ text: footerText, iconURL: footerIcon })
            }

            message = {
                embeds: [embed]
            }
        } else {
            message = placeholderReplace(leave.message, member.guild, member.user)
        }

        if (!leave.dm) {
            if (!leave.channel) return
            member.guild.channels.cache.get(leave.channel).send(message)
        } else {
            try {
                member.send(message)
            } catch (err) { console.log(err) }
        }
    }
}