const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Clears a certain amount of messages from a channel.",
            options: [
                {
                    name: "amount",
                    type: "NUMBER",
                    description: "The user you want to kick from the server.",
                    required: true
                }
            ],
            category: "moderation",
            usage: "<amount>"
        })
    }

    run = async (message) => {
        let roleId

        if (message.guild.db?.moderation?.moderator_role) { roleId = message.guild.db.moderation.moderator_role }

        if (roleId) {
            if (!message.member.roles.cache.some(r => r.id === roleId)) return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setColor("RED")
                        .setDescription("You don't have permission to clear messages.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        } else {
            if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setColor("RED")
                        .setDescription("You need the `MANAGE_MESSAGES` permission to clear messages. \n\n> Ask a Server Admin to create a Moderator Role with `/config moderation moderator_role <role>` to allow a specific role to access moderation commands.")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                        .setTimestamp()
                ],
                ephemeral: true
            })
        }

        var amount = message.options.getNumber('amount')

        if (amount > 100) amount = 100

        if (amount === 0 || amount < 0) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Error")
                    .setDescription("Please insert a valid amount of messages to purge.")
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ], ephemeral: true
        })

        const { size } = await message.channel.bulkDelete(amount, true)

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Successfully deleted \`${size}\` messages from the channel.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            ephemeral: true
        })
    }
}