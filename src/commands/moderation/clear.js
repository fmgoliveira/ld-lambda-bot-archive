const { MessageEmbed, CommandInteractionOptionResolver } = require("discord.js")
const Command = require("../../structures/Command")
const { missingClientPermissions } = require("../../structures/embeds/ErrorEmbed")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Clears a certain amount of messages from a channel (up to 300).",
            options: [
                {
                    name: "amount",
                    type: "NUMBER",
                    description: "The amount of messages you want to purge you want to kick from the server.",
                    required: true
                }
            ],
            category: "moderation",
            usage: "<amount>",
            permissions: ["MANAGE_MESSAGES"]
        })
    }

    run = async (message) => {

        if (!message.guild.members.cache.get(this.client.user.id).permissionsIn(message.channel).has("MANAGE_MESSAGES")) return message.reply(missingClientPermissions(this.client, ["MANAGE_MESSAGES"]))

        var amount = message.options.getNumber('amount')
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

        let tempSize

        if (amount <= 100) {
            let { size } = await message.channel.bulkDelete(amount, true).catch(err => console.log(err))
            tempSize = size
        }
        else if (amount <= 200) {
            let { size } = await message.channel.bulkDelete(100, true).catch(err => console.log(err))
            let left = amount - size
            if (left > 0) {
                setTimeout(async () => {
                    let { size } = await message.channel.bulkDelete(left, true).catch(err => console.log(err))
                    tempSize = 100 + size
                }, 3000)
            }
        }
        else if (amount <= 300) {
            let { size } = await message.channel.bulkDelete(100, true).catch(err => console.log(err))
            let left = amount - size
            if (left > 0) {
                setTimeout(async () => {
                    let { size } = await message.channel.bulkDelete(100, true).catch(err => console.log(err))
                    let left2 = left - size

                    if (left2 > 0) {
                        setTimeout(async () => {
                            let { size } = await message.channel.bulkDelete(left, true).catch(err => console.log(err))
                            tempSize = 200 + size
                        }, 3000)
                    }
                }, 3000)
            }
        }
        else {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Error")
                        .setDescription(`Please inform a valid amount (\`1-300\`).`)
                        .setColor("RED")
                        .setTimestamp()
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                ],
                ephemeral: true
            })
        }

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Successfully deleted \`${tempSize}\` messages from the channel.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            ephemeral: true
        })
    }
}