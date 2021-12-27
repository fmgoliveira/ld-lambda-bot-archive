module.exports = async (client) => {
    let list = []
    const users = await client.db.users.find()

    users.forEach(user => {
        list.push(user)
    })
    return list
}