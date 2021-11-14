const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const Event = require("../../structures/Event")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "messageCreate"
        })
    }

    run = async (message) => {
        if (message.guild.id === process.env.LAMBDA_GUILD_ID) {
            if (message.member.roles.cache.some(r => r.id === process.env.BOT_ADMIN_ROLE_ID)) {
                if (message.content.split(" ")[0] === "!bl") {
                    if (!message.content.split(" ")[1]) return

                    const userId = message.content.split(" ")[1]
                    const blUser = await this.client.db.users.findById(userId) || new this.client.db.users({ _id: userId })

                    if (blUser.blacklisted) return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Error")
                                .setColor("RED")
                                .setDescription(`The user with ID \`${userId}\` is already blacklisted.`)
                                .setFooter(this.client.user.username, this.client.user.avatarURL())
                                .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    blUser.blacklisted = true
                    blUser.save()

                    return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Success")
                                .setColor("GREEN")
                                .setDescription(`The user with ID \`${userId}\` has been blacklisted.`)
                                .setFooter(this.client.user.username, this.client.user.avatarURL())
                                .setTimestamp()
                        ],
                        ephemeral: true
                    })
                } else if (message.content.split(" ")[0] === "!wl") {
                    if (!message.content.split(" ")[1]) return

                    const userId = message.content.split(" ")[1]
                    const blUser = await this.client.db.users.findById(userId) || new this.client.db.users({ _id: userId })

                    if (!blUser.blacklisted) return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Error")
                                .setColor("RED")
                                .setDescription(`The user with ID \`${userId}\` is not blacklisted.`)
                                .setFooter(this.client.user.username, this.client.user.avatarURL())
                                .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    blUser.blacklisted = false
                    blUser.save()

                    return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Success")
                                .setColor("GREEN")
                                .setDescription(`The user with ID \`${userId}\` has been whitelisted.`)
                                .setFooter(this.client.user.username, this.client.user.avatarURL())
                                .setTimestamp()
                        ],
                        ephemeral: true
                    })

                } else if (message.content.split(" ")[0] === "!leave") {
                    if (!message.content.split(" ")[1]) return
                
                    const guildId = message.content.split(" ")[1]
                    const guild = await this.client.guilds.cache.get(guildId) 

                    if (!guild) return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Error")
                                .setColor("RED")
                                .setDescription(`I'm not in that guild.`)
                                .setFooter(this.client.user.username, this.client.user.avatarURL())
                                .setTimestamp()
                        ],
                        ephemeral: true
                    })

                    guild.leave()

                    return message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Success")
                                .setColor("GREEN")
                                .setDescription(`I left the guild with id \`${guildId}\`.`)
                                .setFooter(this.client.user.username, this.client.user.avatarURL())
                                .setTimestamp()
                        ],
                        ephemeral: true
                    })
                } else if (message.content.split(" ")[0] === "!guilds") {
                    const guilds = this.client.guilds.cache.map(guild => guild)

                    const embed = new MessageEmbed()
                        .setTitle("Guilds")
                        .setColor("ORANGE")
                        .setDescription(`These are the guilds I'm in:`)
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()

                    for (const guild of guilds) {
                        embed.addField(guild.name, `**ID:** ${guild.id}\n**Created at:** ${guild.createdAt.toLocaleString()}\n**Members:** ${guild.memberCount}\n**Owner ID:** ${guild.ownerId}`, true)
                    }

                    return message.reply({ embeds: [ embed ], ephemeral: true })
                }
            }
        }
    }
}