module.exports = (client) => {
    let list = []
    client.guilds.cache.forEach(guild => {
        if (guild.members.cache.has(client.user.id)) list.push(guild)
    })

    return list
}