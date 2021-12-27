const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "ban",
            description: "Bans an user from the server.",
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to ban from the server.",
                    required: true
                },
                {
                    name: "reason",
                    type: "STRING",
                    description: "The reason why you want to ban the user from the server.",
                    required: false
                }
            ],
            category: "moderation",
            usage: "<user> (reason)",
            permissions: [ "BAN_MEMBERS" ]
        })
    }

    run = (message) => {
        const user = message.options.getUser('user')
        
        if (message.user.id === user.id) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't ban yourself. If you want, just leave the server by yourself.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        const member = message.guild.members.cache.get(user.id)
        if (member.roles.highest.position >= message.member.roles.highest.position) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("You can't ban users with a role above yours.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })
        if (message.guild.me.roles.highest.position <= member.roles.highest.position || message.guild.ownerId === member.id) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("I can't ban this user, one of his roles is above mine.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        const reason = message.options.getString('reason') || 'No reason specified.'

        message.guild.members.ban(user, { reason })
            .then(() => message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Success")
                        .setDescription(`User \`${user.tag}\` banned successfully. | ${reason}`)
                        .setColor("#fff59d")
                ]
            }))
            .catch(() => message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setColor("RED")
                        .setDescription("And error occurred while running this command. \n\n> *Please get in contact with our team in our* **support server**.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true,
                components: [new MessageActionRow().addComponents(
                    new MessageButton()
                        .setEmoji("<:logo:921033010764218428>")
                        .setLabel("Join Lambda Development")
                        .setURL(process.env.SERVER_LINK)
                        .setStyle("LINK")
                )], ephemeral: true
            }))
    }
}