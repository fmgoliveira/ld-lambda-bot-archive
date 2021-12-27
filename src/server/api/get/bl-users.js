module.exports = async (client) => {
    let list = []
    const users = await client.db.users.find({ blacklisted: true })

    users.forEach(user => {
        list.push(user)
    })
    return list
}