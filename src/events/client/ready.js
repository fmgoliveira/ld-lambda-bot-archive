const Event = require("../../structures/Event")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "ready"
        })
    }

    run = async () => {
        console.log("Bot logged in as", this.client.user.username, "in", this.client.guilds.cache.size, "guild(s).")
        this.client.registryCommands()
        await this.client.connectToDatabase()

        let memberCount = 0
        this.client.guilds.cache.forEach(guild => {
            memberCount += guild.memberCount
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
                name: `${this.client.guilds.cache.size} servers`,
                type: "WATCHING"
            },
            {
                name: `${this.client.channels.cache.size} channels`,
                type: "WATCHING"
            },
        ]

        setInterval(() => {
            const activity = activities[currentIndex]

            this.client.user.setPresence({ activities: [activity] })

            currentIndex = currentIndex >= activities.length - 1 ? 0 : currentIndex + 1
        }, 10000)

        
    }
}