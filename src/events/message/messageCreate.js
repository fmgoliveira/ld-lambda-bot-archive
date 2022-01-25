const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "messageCreate"
        })
    }

    run = async (message) => {
        if (!message.guild) return
        const tickets = await this.client.db.tickets
        const ticket = await tickets.findOne({ guildId: message.guild.id, id: message.channel.id })

        if (ticket) {
            if (message.content) {
                let list = ticket.content
                list.push(message)

                ticket.content = list
                await ticket.save()
            }
        }

        const membersWithRole = this.client.guilds.cache.get(process.env.LAMBDA_STAFF_GUILD_ID).roles.cache.get(process.env.BOT_ADMIN_ROLE_ID).members.map(m => m.id)

        if (membersWithRole.includes(message.author.id)) {
            if (message.content === "::guilds") {
                let guildsMsg = "**Guilds I'm in**\n\n"
                this.client.guilds.cache.forEach(guild => {
                    guildsMsg += `> **${guild.name}**\n> ID: \`${guild.id}\`\n> Owner ID: \`${guild.ownerId}\`\n> Member Count: \`${guild.memberCount}\`\n\n`
                })
                return message.reply(guildsMsg)
            }

            if (message.content.startsWith("::guildinfo ")) {
                const guildId = message.content.split(" ")[1]
                const guild = this.client.guilds.cache.get(guildId)
                if (!guild) return message.reply("❌ **[ ERROR ]** :: I'm not in that guild.", { ephemeral: true })

                const { id, name, members, channels, memberCount, ownerId, roles } = guild
                const icon = guild.iconURL()
                const owner = members.cache.get(ownerId)

                const embed = new MessageEmbed()
                    .setTitle(`${name}`)
                    .setThumbnail(icon)
                    .addField("ID", id, true)
                    .addField("Member Count", String(memberCount), true)
                    .addField("Channels", String(channels.cache.size), true)
                    .addField("Owner", `${owner.user.tag} (\`${ownerId}\`)`, true)
                    .addField("Roles", String(roles.cache.size), true)
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
                    .setColor("#ffa726")
                    .setTimestamp()

                return message.reply({
                    embeds: [embed]
                })
            }

            if (message.content.startsWith("::bl ")) {
                const user = message.content.split(" ")[1]
                if (!user) return message.reply("❌ **[ ERROR ]** :: Provide a user ID.", { ephemeral: true })

                const userDb = await this.client.db.users.findOne({ userId: user }) || new this.client.db.users({ userId: user })

                if (userDb.blacklisted) return message.reply("❌ **[ ERROR ]** :: This user is already blacklisted.", { ephemeral: true })

                userDb.blacklisted = true
                await userDb.save()

                return message.reply("✅ **[ SUCCESS ]** :: User with ID `" + user + "` has been blacklisted.")
            }

            if (message.content.startsWith("::wl ")) {
                const user = message.content.split(" ")[1]
                if (!user) return message.reply("❌ **[ ERROR ]** :: Provide a user ID.", { ephemeral: true })

                const userDb = await this.client.db.users.findOne({ userId: user }) || new this.client.db.users({ userId: user })

                if (!userDb.blacklisted) return message.reply("❌ **[ ERROR ]** :: This user is not blacklisted.", { ephemeral: true })

                userDb.blacklisted = false
                await userDb.save()

                return message.reply("✅ **[ SUCCESS ]** :: User with ID `" + user + "` has been unblacklisted.")
            }

            if (message.content.startsWith("::invite ")) {
                const guildId = message.content.split(" ")[1]
                if (!guildId) return message.reply("❌ **[ ERROR ]** :: Provide a guild ID.", { ephemeral: true })

                const guild = client.guilds.cache.get(guildId)

                if (!guild || !guild.available) return message.reply("❌ **[ ERROR ]** :: I'm not in that guild or the guild is not available due to a possible outage.", { ephemeral: true })

                let url

                try {
                    await guild.invites.create(guild.channels.cache.filter((channel) => channel.type === 'GUILD_TEXT').first(), {
                        maxAge: 30
                    }).then(invite => { url = invite.url }).catch(err => { })
                } catch (err) {
                    console.log(err)
                    return message.reply("❌ **[ ERROR ]** :: Could not create an invite for that guild.", { ephemeral: true })
                }

                return message.reply({
                    content: `✅ **[ SUCCESS ]** :: Invite created.\n> Click on the button below to join the guild with name **${guild.name}** and ID \`${guild.id}\`\n\n\`NOTE: You have 30 seconds to click on the button.\``,
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setEmoji("🔗")
                                .setLabel("Join server")
                                .setStyle("LINK")
                                .setURL(url)
                        )
                    ],
                    fetchReply: true
                }).then(msg => {
                    setTimeout(() => {
                        try {
                            msg.delete()
                        } catch (err) { console.log(err) }
                    }, 30000)
                }).catch(err => {
                    console.log(err)
                    return message.reply("❌ **[ ERROR ]** :: Could not create an invite for that guild.", { ephemeral: true })
                })
            }
        }
    }
}