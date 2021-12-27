module.exports = async (client, id) => {
    return await client.db.users.find({ _id: id })
}