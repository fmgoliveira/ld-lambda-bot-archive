const Event = require("../../structures/Event")
const { MessageEmbed } = require("discord.js")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "guildCreate"
        })
    }

    run = async (guild) => {
        console.log("Bot joined ", guild.name)
        this.client.updateStatus()
        this.client.channels.cache.get(process.env.LAMBDA_GUILD_LOGS).send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Bot joined Guild")
                    .addField("Name", guild.name, true)
                    .addField("ID", guild.id, true)
                    .addField("Owner ID", guild.ownerId, true)
                    .addField("Members", guild.memberCount, true)
                    .setTimestamp()
                    .setColor("GREEN")
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })
        
        try {
            guild.members.cache.get(guild.ownerId).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Thank you for inviting Lambda")
                        .setDescription("Get started by running `/help`")
                        .addField("Support Server", `Click [here](https://dsc.gg/lambda-group) to join **Lambda Group**`)
                        .setTimestamp()
                        .setColor("#ffa726")
                        .setFooter(this.client.user.username, this.client.user.avatarURL())
                ]
            })
        } catch(err) {
            console.log(err)
        }
    }
}