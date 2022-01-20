const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")
const placeholderReplace = require("../../structures/utils/placeholderReplace")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "guildMemberAdd"
        })
    }

    run = async (member) => {
        const settings = this.client.db.guilds.findOne({ guildId: member.guild.id }) || new this.client.db.guilds({ guildId: member.guild.id })
        const welcome = settings.welcome

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
                embed.setAuthor(author, authorAvatar, authorUrl)
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
                embed.setFooter(footerText, footerIcon)
            }

            message = {
                embeds: [ embed ]
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

        this.client.updateStatus()

        if (settings.autorole.active) {
            if (settings.autorole.id) {
                try {
                    member.roles.add(settings.autorole.id)
                } catch (err) { console.log(err) }
            }
        }

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
        
        return
    }
}