const fetch = require("node-fetch")
const { Client } = require("discord.js")

/**
 * 
 * @param {Client} client 
 */
module.exports = (client) => {
    setInterval(() => {
        fetch('https://botlist.scarps.club/api/auth/stats/900398063607242762', {
            method: "POST",
            headers: {
                Authorization: process.env.SCARPS_BOTLIST_TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "server_count": client.guilds.cache.size })
        }).then(response => response.text()).catch(console.error)

        fetch('https://bots.discordlabs.org/v2/bot/900398063607242762/stats', {
            method: "POST",
            headers: {
                Authorization: process.env.DISCORD_LABS_TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "server_count": client.guilds.cache.size })
        }).then(response => response.text()).catch(console.error)

        fetch('https://discords.com/bots/api/bot/900398063607242762', {
            method: "POST",
            headers: {
                Authorization: process.env.BOTSFORDISCORD_TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "server_count": client.guilds.cache.size })
        }).then(response => response.text()).catch(console.error)

        fetch('https://top.gg/api/bots/900398063607242762/stats', {
            method: "POST",
            headers: {
                Authorization: process.env.TOP_GG_TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "server_count": client.guilds.cache.size })
        }).then(response => response.json().then(res => console.log(res))).catch(console.error)
    }, 60000)
}