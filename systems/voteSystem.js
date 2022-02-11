const fetch = require("node-fetch")
const { Client, Collection } = require("discord.js")

/**
 * 
 * @param {Client} client 
 */
module.exports = async (client) => {
    const getVotedMembers = async () => {
        const db = await client.db.votes.find({})

        db.forEach(doc => {
            const time = doc.time * 1000
            const now = Date.now() - 43200000
            if (time >= now) db.delete({ _id: doc.id })
        })

        const scarpsRes = await fetch('https://botlist.scarps.club/api/auth/liked/900398063607242762', {
            headers: { 'Authorization': process.env.SCARPS_BOTLIST_TOKEN }
        })
        const votedScarpsList = (await scarpsRes.json().catch(err => console.log(err))).users || []

        const labsRes = await fetch("https://bots.discordlabs.org/v2/bot/900398063607242762/votes")

        const votedDiscordLabsRaw = eval(await labsRes.text().catch(err => console.log(err)))
        const votedDiscordLabs = []

        for (user of votedDiscordLabsRaw) {
            const time = user.time * 1000
            const now = Date.now() - 43200000
            if (time >= now) votedDiscordLabs.push(user)
        }

        const votedBotsForDiscord = await client.db.votes.find({ list: "botsfordiscord" })
        const votedTopGG = await client.db.votes.find({ list: "topgg" })

        const members = client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).members.cache
        const votedMembers = new Collection()

        if (votedScarpsList) votedScarpsList.forEach(member => {
            votedMembers.set(member.userid, {
                user: members.get(member.userid),
                amount: votedMembers.has(member.userid) ? votedMembers.get(member.userid).amount + 1 : 1
            })
        })
        if (votedDiscordLabs) votedDiscordLabs.forEach(member => {
            votedMembers.set(member.uid, {
                user: members.get(member.uid),
                amount: votedMembers.has(member.uid) ? votedMembers.get(member.uid).amount + 1 : 1
            })
        })
        if (votedBotsForDiscord) votedBotsForDiscord.forEach(member => {
            votedMembers.set(member.userId, {
                user: members.get(member.userId),
                amount: votedMembers.has(member.userId) ? votedMembers.get(member.userId).amount + 1 : 1
            })
        })
        if (votedTopGG) votedTopGG.forEach(member => {
            votedMembers.set(member.userId, {
                user: members.get(member.userId),
                amount: votedMembers.has(member.userId) ? votedMembers.get(member.userId).amount + 1 : 1
            })
        })

        return votedMembers
    }

    const updateMemberRoles = (votedMembers) => {
        const membersWithVoted1Role = client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).roles.cache.get(process.env.VOTED1_ROLE).members.map(m => m)
        const membersWithVoted2Role = client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).roles.cache.get(process.env.VOTED2_ROLE).members.map(m => m)
        const membersWithVoted3Role = client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).roles.cache.get(process.env.VOTED3_ROLE).members.map(m => m)
        const membersWithVoted4Role = client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).roles.cache.get(process.env.VOTED4_ROLE).members.map(m => m)

        membersWithVoted1Role.forEach(member => {
            const Member = votedMembers.get(member.id)
            if (!Member || Member.amount < 1) member.roles.remove(process.env.VOTED1_ROLE)
        })
        membersWithVoted2Role.forEach(member => {
            const Member = votedMembers.get(member.id)
            if (!Member || Member.amount < 2) member.roles.remove(process.env.VOTED2_ROLE)
        })
        membersWithVoted3Role.forEach(member => {
            const Member = votedMembers.get(member.id)
            if (!Member || Member.amount < 3) member.roles.remove(process.env.VOTED3_ROLE)
        })
        membersWithVoted4Role.forEach(member => {
            const Member = votedMembers.get(member.id)
            if (!Member || Member.amount < 4) member.roles.remove(process.env.VOTED4_ROLE)
        })

        votedMembers.forEach(member => {
            const amount = member.amount
            const user = member.user

            if (amount >= 1) {
                try {
                    if (!user.roles.cache.has(process.env.VOTED1_ROLE)) user.roles.add(process.env.VOTED1_ROLE)
                } catch (err) { console.log(err) }
            }
            if (amount >= 2) {
                try {
                    if (!user.roles.cache.has(process.env.VOTED2_ROLE)) user.roles.add(process.env.VOTED2_ROLE)
                } catch (err) { console.log(err) }
            }
            if (amount >= 3) {
                try {
                    if (!user.roles.cache.has(process.env.VOTED3_ROLE)) user.roles.add(process.env.VOTED3_ROLE)
                } catch (err) { console.log(err) }
            }
            if (amount >= 4) {
                try {
                    if (!user.roles.cache.has(process.env.VOTED4_ROLE)) user.roles.add(process.env.VOTED4_ROLE)
                } catch (err) { console.log(err) }
            }
        })
    }

    const webhook = (await client.guilds.cache.get(process.env.LAMBDA_GUILD_ID).fetchWebhooks()).get("936677792702140416")
    const updateVotedMessage = (votedMembers) => {
        let string = "**USERS WHO HAVE VOTED IN THE LAST 12 HOURS**\n\n"

        if (votedMembers.size === 0) {
            string += "*There are no users who have voted in the last 12 hours.*"
        } else {
            const getRole = (amount) => {
                if (amount === 1) {
                    return `<:voted:937668445640724480> <@&${process.env.VOTED1_ROLE}>`
                } else if (amount === 2) {
                    return `<:double_voted:937668445695266867> <@&${process.env.VOTED2_ROLE}>`
                } else if (amount === 3) {
                    return `<:triple_voted:937668445728800808> <@&${process.env.VOTED3_ROLE}>`
                } else if (amount === 4) {
                    return `<:dominating_votes:937668445686878208> <@&${process.env.VOTED4_ROLE}>`
                }
            }
            votedMembers.forEach(member => {
                string += `• <@${member.user.id}> (${member.user.user.tag}) | **${member.amount}** vote streak | **Role:** ${getRole(member.amount)}\n`
            })
        }

        webhook.editMessage("937720116261584907", {
            content: string
        })
    }


    setInterval(async () => {
        const votedMembers = await getVotedMembers()
        updateMemberRoles(votedMembers)
        updateVotedMessage(votedMembers)
    }, 3000)
}