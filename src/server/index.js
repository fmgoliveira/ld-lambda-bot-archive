const express = require("express")

module.exports = function createWebServer(client) {
    const app = express()
    const port = process.env.PORT || 8888

    const [memberCountStr, guildCountStr, channelCountStr] = getCounters(client)

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    })

    app.get("/", (req, res) => {
        res.send(`${guildCountStr} | ${channelCountStr} | ${memberCountStr}`)
    })

    app.get("/api/get/:param", async (req, res) => {
        switch (req.params.param) {
            case "guilds":
                res.send(require("./api/get/guilds")(client))
                console.log(`GET Request at /api/get/${req.params.param}`)
                break
            case "bl-users":
                res.send(await require("./api/get/bl-users")(client))
                console.log(`GET Request at /api/get/${req.params.param}`)
                break
            case "users":
                res.send(await require("./api/get/users")(client))
                console.log(`GET Request at /api/get/${req.params.param}`)
                break
            default:
                res.status(404).send("Not found")
                console.log(`GET Request at /api/get/${req.params.param} failed`)
                break
        }
    })

    app.get("/api/get/db/:collection/:id", async (req, res) => {
        try {
            switch (req.params.collection) {
                case "guilds":
                    res.send(await require(`./api/db/guilds`)(client, req.params.id))
                    console.log(`GET Request at /api/get/db/${req.params.collection} with ID ${req.params.id}`)
                    break
                case "config":
                    res.send(await require(`./api/db/guilds`)(client, req.params.id))
                    console.log(`GET Request at /api/get/db/${req.params.collection} with ID ${req.params.id}`)
                    break
                case "users":
                    res.send(await require(`./api/db/users`)(client, req.params.id))
                    console.log(`GET Request at /api/get/db/${req.params.collection} with ID ${req.params.id}`)
                    break
                default:
                    res.status(404).send("Not found")
                    console.log(`GET Request at /api/get/db/${req.params.collection} with ID ${req.params.id} failed`)
                    break
            }
        } catch (err) {
            if (err.code === "MODULE_NOT_FOUND") res.status(404).send("Not found")
            else res.status(500).send("Internal Server Error") && console.log(err)
            console.log(`GET Request at /api/get/db/${req.params.collection} with ID ${req.params.id} failed`)
        }
    })

    app.post("/api/config/:guildId/:category/:option/:value/", async (req, res) => {
        try {
            switch (req.params.category) {
                case "tickets":
                    res.send(require(`./api/config/tickets/${req.params.option}`)(client, req.params.value, req.params.guildId))
                    console.log(`POST Request at /api/config/tickets/${req.params.option} with value ${req.params.id} and guildId ${req.params.guildId}`)
                    break
                case "moderation":
                    res.send(require(`./api/config/moderation/${req.params.option}`)(client, req.params.value, req.params.guildId))
                    console.log(`POST Request at /api/config/moderation/${req.params.option} with value ${req.params.id} and guildId ${req.params.guildId}`)
                    break
                case "welcome":
                    res.send(require(`./api/config/welcome/${req.params.option}`)(client, req.params.value, req.params.guildId))
                    console.log(`POST Request at /api/config/welcome/${req.params.option} with value ${req.params.id} and guildId ${req.params.guildId}`)
                    break
                default:
                    res.status(404).send("Not found")
                    console.log(`POST Request at /api/get/config/${req.params.category}/${req.params.option} with value ${req.params.id} and guildId ${req.params.guildId} failed`)
                    break
            }
        } catch (err) {
            if (err.code === "MODULE_NOT_FOUND") res.status(404).send("Not found")
            else res.status(500).send("Internal Server Error") && console.log(err)
            console.log(`GET Request at /api/get/db/${req.params.collection} with ID ${req.params.id} failed`)
        }
    })

    app.listen(port, () => {
        console.log(`🌐 Webserver started on port ${process.env.PORT || 8888} successfully.`)
    })
}

function getCounters(client) {
    let memberCount = 0
    client.guilds.cache.forEach(guild => {
        if (guild.members.cache.has(client.user.id)) memberCount += guild.memberCount
    })

    let memberCountStr = String(memberCount)
    let guildCountStr = String(client.guilds.cache.size)
    let channelCountStr = String(client.channels.cache.size)

    if (memberCountStr.length >= 7) memberCountStr = `${memberCountStr.slice(0, -6)}M+`
    if (memberCountStr.length >= 4) memberCountStr = `${memberCountStr.slice(0, -3)}K+`

    if (guildCountStr.length >= 7) guildCountStr = `${guildCountStr.slice(0, -6)}M+`
    if (guildCountStr.length >= 4) guildCountStr = `${guildCountStr.slice(0, -3)}K+`

    if (channelCountStr.length >= 7) channelCountStr = `${channelCountStr.slice(0, -6)}M+`
    if (channelCountStr.length >= 4) channelCountStr = `${channelCountStr.slice(0, -3)}K+`

    return [memberCountStr, guildCountStr, channelCountStr]
}