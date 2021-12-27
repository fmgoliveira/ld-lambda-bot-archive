const { Client } = require("discord.js")
const { connect } = require("mongoose")
const { cwd } = require("process")
const Models = require("../database/models/Models")
const Ascii = require("ascii-table");
const { readdirSync } = require("fs");
const createWebServer = require("../server/index")

module.exports = class extends Client {
    constructor(options) {
        super(options)

        this.commands = []
        this.loadEvents()
        this.loadCommands()
    }

    startWebServer() {
        createWebServer(this)
    }

    updateStatus() {
        let memberCount = 0
        this.guilds.cache.forEach(guild => {
            if (guild.members.cache.has(this.user.id)) memberCount += guild.memberCount
        })

        let currentIndex = 0
        const activities = [
            {
                name: `/help`,
                type: "LISTENING"
            },
            {
                name: `${memberCount} users`,
                type: "LISTENING"
            },
            {
                name: `${this.guilds.cache.size} servers`,
                type: "WATCHING"
            },
            {
                name: `${this.channels.cache.size} channels`,
                type: "WATCHING"
            },
        ]

        setInterval(() => {
            const activity = activities[currentIndex]

            this.user.setPresence({ activities: [activity] })

            currentIndex = currentIndex >= activities.length - 1 ? 0 : currentIndex + 1
        }, 10000)
    }

    registerCommands() {
        // Lambda Guilds
        this.guilds.cache.get(process.env.LAMBDA_GUILD_ID).commands.set(this.commands)
        this.guilds.cache.get(process.env.LAMBDA_STAFF_GUILD_ID).commands.set(this.commands)

        // Other Guilds
        this.application.commands.set(this.commands)
    }

    loadCommands() {
        const Table = new Ascii("Loaded Commands");

        const categories = readdirSync("src/commands")
        categories.forEach(category => {
            const commandFiles = readdirSync(`src/commands/${category}`)
            commandFiles.forEach(commandFile => {
                const cmd = require(`../commands/${category}/${commandFile.replace(".js", "")}`)
                const Permissions = require("../validation/PermissionNames").Permissions

                const command = new (cmd)(this)

                command.category = category

                if (!command.name) {
                    const pathToFile = `${category}/${commandFile}`
                    Table.addRow(`${commandFile.replace(".js", "")}`, `🔴 Name missing: ${pathToFile}`)
                    return
                }
                if (!command.description) {
                    const pathToFile = `${category}/${commandFile}`
                    Table.addRow(`${command.name}`, `🔴 Description missing: ${pathToFile}`)
                    return
                }
                if (command.permissions) {
                    if (!command.permissions.every(elem => Permissions.includes(elem))) {
                        const pathToFile = `${category}/${commandFile}`
                        Table.addRow(`${command.name}`, `🔴 One of the permissions is invalid: ${pathToFile}`)
                        return
                    }
                }

                Table.addRow(command.name, `🟢 Command loaded successfully`)

                if (!this.commands.includes(command)) this.commands.push(command)
            })
        })

        console.log(Table.toString())
    }

    loadEvents() {
        const Table = new Ascii("Loaded Events");

        const categories = readdirSync("src/events")
        categories.forEach(category => {
            const eventFiles = readdirSync(`src/events/${category}`)
            eventFiles.forEach(eventFile => {
                const evt = require(`../events/${category}/${eventFile.replace(".js", "")}`)
                const Events = require("../validation/EventNames").Events

                const event = new (evt)(this)

                if (!Events.includes(event.name) || !event.name) {
                    const pathToFile = `${category}/${eventFile}`
                    Table.addRow(`${event.name || "MISSING"}`, `🔴 Event name invalid or missing: ${pathToFile}`)
                    return
                }

                if (event.once) {
                    this.once(event.name, event.run)
                } else {
                    this.on(event.name, event.run)
                }

                Table.addRow(event.name, `🟢 Event loaded successfully`)
            })
        })

        console.log(Table.toString())
    }

    connectToDatabase() {
        const connection = connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        this.db = { connection, ...Models }

        console.log("💾 Connected to MongoDB database successfully.")
    }
}
