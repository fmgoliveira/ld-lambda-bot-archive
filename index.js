require("dotenv").config()
const { promisify } = require("util")
const { glob } = require("glob")
const PG = promisify(glob)
const Ascii = require("ascii-table")

const { Client, Collection } = require("discord.js")
const client = new Client({
    intents: 6143
})

client.commands = new Collection()
client.color = "#ffa726"
client.updateStatus = (_client) => {
    let memberCount = 0
    _client.guilds.cache.forEach(guild => {
        if (guild.members.cache.has(_client.user.id)) memberCount += guild.memberCount
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
            name: `${_client.guilds.cache.size} servers`,
            type: "WATCHING"
        },
        {
            name: `${_client.channels.cache.size} channels`,
            type: "WATCHING"
        },
    ]

    setInterval(() => {
        const activity = activities[currentIndex]

        _client.user.setPresence({ activities: [activity] })

        currentIndex = currentIndex >= activities.length - 1 ? 0 : currentIndex + 1
    }, 60000)
}

const { DisTube } = require("distube")
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: true,
    leaveOnEmpty: true,
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true
        }),
        new SoundCloudPlugin()
    ]
})
module.exports = client

require("./systems/giveawaySystem")(client)
require("./systems/errorSystem");

["events", "commands"].forEach(handler => {
    require(`./handlers/${handler}`)(client, PG, Ascii)
})

client.login(process.env.TOKEN)
