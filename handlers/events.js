const { Events } = require("../validation/EventNames")

/**
 *
 * @param {Client} client
 */
module.exports = async (client, PG, Ascii) => {
    const table = new Ascii("Loaded Events");

    (await PG(`${process.cwd()}/events/*/*.js`)).map(async (file) => {
        const event = require(file)

        if (!Events.includes(event.name) || !event.name) {
            const L = file.split("/")
            table.addRow(`${event.name}` || `Missing`, `🔴 Event name is either invalid or missing: ${L[L.length - 2]}/${L.length - 1}`)
            return
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client))
        } else {
            client.on(event.name, (...args) => event.execute(...args, client))
        }

        table.addRow(`${event.name}`, `🟢 Event loaded successfully`)
    })

    console.log(table.toString())
}