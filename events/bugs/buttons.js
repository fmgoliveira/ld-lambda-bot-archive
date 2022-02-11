const { ButtonInteraction, Client, MessageEmbed } = require("discord.js")
const bugButtons = require("../../utils/components/bugButtons")

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return
        if (interaction.customId.split("-")[0] !== "bug") return
        const { customId, message } = interaction
        const buttonId = customId.split("-")[1]

        switch (buttonId) {
            case "verify":
                var db = await client.db.bugs.findOneAndUpdate({ _id: message.embeds[0].fields[0].value }, { status: "✅ Verified" })

                var content = {
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Bug Report`)
                            .addField("ID", String(db._id), true)
                            .addField("Description", db.content)
                            .addField("Reported by", db.user, true)
                            .addField("Guild", db.guild, true)
                            .addField("Status", "✅ Verified", true)
                            .setTimestamp()
                            .setColor(client.color)
                            .setFooter(client.footer)
                    ],
                    components: bugButtons(true, false, false, false)
                }

                return interaction.deferUpdate(message.edit(content))
                break

            case "delete":
                await client.db.bugs.deleteOne({ _id: message.embeds[0].fields[0].value })

                return interaction.deferUpdate(message.delete())
                break

            case "onhold":
                var db = await client.db.bugs.findOneAndUpdate({ _id: message.embeds[0].fields[0].value }, { status: "<:status_yellow:906087532356304906> On Hold" })

                var content = {
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Bug Report`)
                            .addField("ID", String(db._id), true)
                            .addField("Description", db.content)
                            .addField("Reported by", db.user, true)
                            .addField("Guild", db.guild, true)
                            .addField("Status", "<:status_yellow:906087532356304906> On Hold", true)
                            .setTimestamp()
                            .setColor("GOLD")
                            .setFooter(client.footer)
                    ],
                    components: bugButtons(true, false, true, false)
                }

                return interaction.deferUpdate(message.edit(content))
                break

            case "resolve":
                var db = await client.db.bugs.findOneAndUpdate({ _id: message.embeds[0].fields[0].value }, { status: "<:status_green:906087473627668490> Resolved" })

                var content = {
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Bug Report`)
                            .addField("ID", String(db._id), true)
                            .addField("Description", db.content)
                            .addField("Reported by", db.user, true)
                            .addField("Guild", db.guild, true)
                            .addField("Status", "<:status_green:906087473627668490> Resolved", true)
                            .setTimestamp()
                            .setColor("GREEN")
                            .setFooter(client.footer)
                    ],
                    components: bugButtons(true, true, false, false)
                }

                return interaction.deferUpdate(message.edit(content))
                break

            case "wontfix":
                var db = await client.db.bugs.findOneAndUpdate({ _id: message.embeds[0].fields[0].value }, { status: "<:status_red:906087602447335424> Won't Fix" })

                var content = {
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Bug Report`)
                            .addField("ID", String(db._id), true)
                            .addField("Description", db.content)
                            .addField("Reported by", db.user, true)
                            .addField("Guild", db.guild, true)
                            .addField("Status", "<:status_red:906087602447335424> Won't Fix", true)
                            .setTimestamp()
                            .setColor("RED")
                            .setFooter(client.footer)
                    ],
                    components: bugButtons(true, false, false, true)
                }

                return interaction.deferUpdate(message.edit(content))
                break
            
            default: 
                return interaction.deferUpdate()
                break
        }
    }
}