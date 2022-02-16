const { WebhookClient, MessageEmbed } = require("discord.js")

const errorLogs = new WebhookClient({
    id: process.env.ERROR_WEBHOOK_ID,
    token: process.env.ERROR_WEBHOOK_TOKEN,
    url: process.env.ERROR_WEBHOOK_URL
})

process.on('uncaughtException', (err) => {
    console.log(err)
    if (err.message === "Cannot read properties of undefined (reading 'users')") return
    if (err.message === "Unexpected token '<'") return
    try {
        errorLogs.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`**${err.name}:** ${err.message}`)
                    .setDescription(`\`\`\`${String(err).split(0, 4090)}\`\`\``)
                    .setColor("RED")
                    .setTimestamp()
            ]
        }).catch(() => {
            try {
                errorLogs.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("**[ ERROR ]** " + err.name)
                            .setDescription(`\`\`\`${err.message}\`\`\``)
                            .setColor("RED")
                            .setTimestamp()
                    ]
                })
            } catch (err) {
                console.log(err)
            }
        })
    } catch (err) {
        console.log(err)
        errorLogs.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("**[ ERROR ]** " + err.name)
                    .setDescription(`\`\`\`${err.message}\`\`\``)
                    .setColor("RED")
                    .setTimestamp()
            ]
        })
    }
})

process.on('unhandledRejection', (err) => {
    console.log(err)
    if (err.message === "Cannot read properties of undefined (reading 'users')") return
    if (err.message === "Unexpected token '<'") return
    try {
        errorLogs.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`**${err.name}:** ${err.message}`)
                    .setDescription(`\`\`\`${String(err).split(0, 4090)}\`\`\``)
                    .setColor("RED")
                    .setTimestamp()
            ]
        }).catch(() => {
            try {
                errorLogs.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("**[ ERROR ]** " + err.name)
                            .setDescription(`\`\`\`${err.message}\`\`\``)
                            .setColor("RED")
                            .setTimestamp()
                    ]
                })
            } catch (err) {
                console.log(err)
            }
        })
    } catch (err) {
        console.log(err)
        errorLogs.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("**[ ERROR ]** " + err.name)
                    .setDescription(`\`\`\`${err.message}\`\`\``)
                    .setColor("RED")
                    .setTimestamp()
            ]
        })
    }
})