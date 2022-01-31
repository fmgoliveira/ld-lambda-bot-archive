require("dotenv").config()
const { WebhookClient, MessageEmbed } = require("discord.js")

const Client = require("./src/structures/Client")
const client = new Client({
    intents: 32767
})

const errorLogs = new WebhookClient({
    id: process.env.ERROR_WEBHOOK_ID,
    token: process.env.ERROR_WEBHOOK_TOKEN,
    url: process.env.ERROR_WEBHOOK_URL,
})

process.on('uncaughtException', (err) => {
    console.log(err);
    try {
        errorLogs.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("**[ ERROR ]** " + err.name)
                    .setDescription(`\`\`\`${err.message}\`\`\``)
                    .addField("File Name", err.fileName)
                    .addField("Line Number", err.lineNumber, true)
                    .addField("Column Number", err.columnNumber, true)
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
    } catch (err) { console.log(err) }
})

process.on('unhandledRejection', (err) => {
    console.log(err);
    try {
        errorLogs.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("**[ ERROR ]** " + err.name)
                    .setDescription(`\`\`\`${err.message}\`\`\``)
                    .addField("File Name", err.fileName)
                    .addField("Line Number", err.lineNumber, true)
                    .addField("Column Number", err.columnNumber, true)
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
    } catch (err) { console.log(err) }
})


client.login(process.env.BOT_TOKEN)