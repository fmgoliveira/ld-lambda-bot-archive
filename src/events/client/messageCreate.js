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
                }
            }
        }
    }
}