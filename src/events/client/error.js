const Event = require("../../structures/Event")

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "error",
            once: false
        })
    }

    run = async (error) => {
        console.log("\nBot encountered an error:" + error)
    }
}