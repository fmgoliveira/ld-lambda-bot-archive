const { Permissions } = require("../validation/Permissions")
const { Client } = require("discord.js")

/**
 *
 * @param {Client} client
 */
module.exports = async (client, PG, Ascii) => {
    const table = new Ascii("Loaded Commands")

    const commandsArray = [];

    (await PG(`${process.cwd()}/commands/*/*.js`)).map(async (file) => {
        const command = require(file)

        if (!command.name) {
            const L = file.split("/")
            table.addRow(`${command.name}` || `Missing`, `🔴 Command name is missing`, `${L[L.length - 2]}/${L.length - 1}`)
            return
        }

        if (!command.context && !command.description) {
            const L = file.split("/")
            table.addRow(`${command.name}`, `🔴 Command description is missing`, `${L[L.length - 2]}/${L.length - 1}`)
            return
        }

        if (command.permission) {
            if (Permissions.includes(command.permission)) command.defaultPermission = false
            else {
                const L = file.split("/")
                table.addRow(`${command.name}`, `🔴 Command permission is invalid`, `${L[L.length - 2]}/${L.length - 1}`)
                return
            }
        }

        client.commands.set(command.name, command)
        commandsArray.push(command)

        table.addRow(`${command.name}`, `🟢 Command loaded successfully`)
    })

    console.log(table.toString())

    client.on("ready", async () => {
        client.mainGuild = client.guilds.cache.get(process.env.LAMBDA_GUILD_ID)
        client.staffGuild = client.guilds.cache.get(process.env.LAMBDA_STAFF_GUILD_ID)

        client.application.commands.set(commandsArray)
        client.staffGuild.commands.set(commandsArray)
    })
}
