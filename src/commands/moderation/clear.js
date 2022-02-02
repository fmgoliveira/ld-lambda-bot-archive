const { MessageEmbed, CommandInteractionOptionResolver } = require("discord.js")
const Command = require("../../structures/Command")
const { missingClientPermissions } = require("../../structures/embeds/ErrorEmbed")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Clears a certain amount of messages from a channel (up to 100).",
            options: [
                {
                    name: "amount",
                    type: "NUMBER",
                    description: "The amount of messages you want to purge in this channel.",
                    required: true,
                    minValue: 1,
                    maxValue: 100
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
        let size

        try {
            size = (await message.channel.bulkDelete(amount, true).catch(err => console.log(err))).size
        } catch (err) { console.log(err) }

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Successfully deleted \`${size ? size : 0}\` messages from the channel.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ],
            ephemeral: true
        })
    }
}