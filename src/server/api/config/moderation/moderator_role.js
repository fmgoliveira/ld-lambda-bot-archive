module.exports = (client, value, guildId) => {
    client.db.guilds.findOneAndUpdate({ _id: guildId }, {
        moderation: {
            moderator_role: value === "off" ? undefined : value
        }
    }, { upsert: true } )

    return "Success"
}