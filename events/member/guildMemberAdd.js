const { GuildMember, Client, MessageEmbed } = require("discord.js")
const placeholderReplace = require("../../utils/placeholderReplace")

module.exports = {
    name: "guildMemberAdd",
    /**
     * 
     * @param {GuildMember} member 
     * @param {Client} client 
     */
    async execute(member, client) {
        const settings = await client.db.guilds.findOne({ guildId: member.guild.id }) || new client.db.guilds({ guildId: member.guild.id })
        const welcome = settings.welcome

        if (settings.logging.channel.memberEvents) {
            if (settings.logging.active.memberEvents.memberJoin) {
                try {
                    member.guild.channels.cache.get(settings.logging.channel.memberEvents).send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Member joined")
                                .setDescription(`A new member joined the server: ${member.user.tag} (<@${member.id}> \`${member.id}\`)`)
                                .setColor(settings.logging.color.memberEvents)
                                .setTimestamp()
                        ]
                    })
                } catch (err) { console.log(err) }
            }
        }

        if (!welcome.active) return

        let message

        if (welcome.embed.active) {
            let { author, authorAvatar, authorUrl, title, titleUrl, description, thumbnail, image, footerText, footerIcon, color } = welcome.embed

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
            message = placeholderReplace(welcome.message, member.guild, member.user)
        }

        if (!welcome.dm) {
            if (!welcome.channel) return
            member.guild.channels.cache.get(welcome.channel).send(message)
        } else {
            try {
                member.send(message)
            } catch (err) { console.log(err) }
        }

        client.updateStatus(client)

        if (settings.autorole.active) {
            if (settings.autorole.id) {
                try {
                    member.roles.add(settings.autorole.id).catch(err => console.log(err))
                } catch (err) { console.log(err) }
            }
        }
    }
}