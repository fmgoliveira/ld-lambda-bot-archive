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
        this.client.updateStatus()
        this.client.startWebServer()
    }
}