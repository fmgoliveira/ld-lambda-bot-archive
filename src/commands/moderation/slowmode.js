const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "slowmode",
            description: "Changes a channel slowmode.",
            options: [
                {
                    name: "seconds",
                    type: "NUMBER",
                    description: "The amount of seconds that the slowmode will be set to.",
                    required: true
                }
            ],
            category: "moderation",
            usage: "<seconds>",
            permissions: [ "MANAGE_CHANNELS" ]
        })
    }

    run = async (message) => {

        if (!message.guilds.members.cache.get(this.client.user.id).permissionsIn(message.channel).has("MANAGE_MESSAGES")) return message.reply(missingClientPermissions(this.client, ["MANAGE_MESSAGES"]))

        const amount = message.options.getNumber('seconds')
        const { channel } = message

        channel.setRateLimitPerUser(amount)

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Successfully changed the slowmode of this channel to \`${amount}\`.`)
                    .setColor("#fff59d")
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })
    }
}