module.exports = async (client, id) => {
    return await client.db.guilds.find({ _id: id })
}