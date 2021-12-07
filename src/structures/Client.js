const { Client } = require("discord.js")
const { readdirSync, statSync, readdir } = require("fs")
const { connect } = require("mongoose")
const { join } = require("path")
const { cwd } = require("process")
const Models = require("../database/models/Models")

module.exports = class extends Client {
    constructor(options) {
        super(options)

        this.commands = []
        this.loadCommands()
        this.loadEvents()
    }

    startWebServer() {
        const http = require("http")
        const path = require("path")

        let memberCount = 0
        this.guilds.cache.forEach(guild => {
            if (guild.members.cache.has(this.user.id)) memberCount += guild.memberCount
        })

        let memberCountStr = String(memberCount)

        if (memberCountStr.length >= 7) memberCountStr = `${memberCountStr.slice(0, -6)}M+`
        if (memberCountStr.length >= 4) memberCountStr = `${memberCountStr.slice(0, -3)}K+`

        const server = http.createServer((req, res) => {
            try {
                const headers = {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                    'Access-Control-Max-Age': 2592000, // 30 days
                    /** add other headers as per requirement */
                };
                
                if (req.method === 'OPTIONS') {
                    res.writeHead(204, headers);
                    res.end();
                }

                res.writeHead(200, {"Content-Type": "text/plain"})
                res.end(`{ guilds: ${this.guilds.cache.size}, channels: ${this.channels.cache.size}, users: ${memberCountStr} }`)
            } catch {
                res.writeHead(500, {"Content-Type": "text/plain"})
                res.end("Internal Server Error")
            }
        })

        server.listen(process.env.PORT || 8888)
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

    registryCommands() {
        // temporary
        this.guilds.cache.get('878935240377241701').commands.set(this.commands)

        // const guilds = this.guilds.cache.map(guild => guild.id)

        // for (const guild of guilds) {
        //     this.application.commands.set(this.commands, guild)
        // }

        // for (let guild of this.guilds.cache.map(guild => guild.id)) {
        //     this.application.commands.set(this.commands, guild)
        // }

        this.application.commands.set(this.commands)
    }

    loadCommands(path = "src/commands") {
        const categories = readdirSync(path)

        for (const category of categories) {
            const commands = readdirSync(`${path}/${category}`)

            for (const command of commands) {
                const commandClass = require(join(cwd(), `${path}/${category}/${command}`))
                const cmd = new (commandClass)(this)

                if (!this.commands.includes(cmd)) this.commands.push(cmd)
                console.log(`Command "${cmd.name}" loaded.`)
            }
        }
    }

    loadEvents(path = "src/events") {
        const categories = readdirSync(path)

        for (const category of categories) {
            if (!["client"].includes(category)) continue
            const events = readdirSync(`${path}/${category}`)

            for (const event of events) {
                const eventClass = require(join(cwd(), `${path}/${category}/${event}`))
                const evt = new (eventClass)(this)

                if (evt.name === "ready") { this.once(evt.name, evt.run) }
                else { this.on(evt.name, evt.run) }

                console.log(`Event "${evt.name}" loaded.`)
            }
        }
    }

    async connectToDatabase() {
        const connection = connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        this.db = { connection, ...Models }

        console.log("Connected to MongoDB database.")
    }
}
