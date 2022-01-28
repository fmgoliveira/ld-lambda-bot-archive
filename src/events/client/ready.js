const Event = require("../../structures/Event")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "ready",
            once: true
        })
    }

    run = async () => {
        console.log("\nBot logged in as", this.client.user.username, "in", this.client.guilds.cache.size, "guilds.\n")
        this.client.registerCommands()
        this.client.startWebServer()
        this.client.connectToDatabase()
        this.client.updateStatus()
        this.client.startVoteCheck()
        console.log()
    }
}