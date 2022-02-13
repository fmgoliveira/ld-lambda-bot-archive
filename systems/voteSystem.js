const fetch = require("node-fetch")
const { Client, Collection, MessageEmbed } = require("discord.js")

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
        const embeds = []
        const votedArray = []

        votedMembers.forEach(member => {
            votedArray.push({ user: member.user.user, amount: member.amount })
        })

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

        let firstEmbed = new MessageEmbed()
            .setTitle("**USERS WHO HAVE VOTED IN THE LAST 12 HOURS**")
        let lastEmbed = new MessageEmbed()
            .setFooter({ text: "You can be here too: just upvote the bot!" })

        let embed2 = new MessageEmbed()
        let embed3 = new MessageEmbed()
        let embed4 = new MessageEmbed()
        let embed5 = new MessageEmbed()
        let embed6 = new MessageEmbed()
        let embed7 = new MessageEmbed()
        let embed8 = new MessageEmbed()
        let embed9 = new MessageEmbed()

        if (votedArray.length === 0) {
            firstEmbed.setFooter({ text: "You can be here: just upvote the bot!" }).setDescription(`There are no users who have upvoted the bot in the last 12 hours. **Be the first!**`)
            embeds.push(firstEmbed)
        } else {
            firstEmbed.setFooter({ text: "You can be here too: just upvote the bot!" })
            var string = ""

            votedArray.slice(0, 40).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            firstEmbed.setDescription(string)
            embeds.push(firstEmbed)
        }

        if (votedArray.length > 40) {
            var string = ""

            votedArray.slice(40, 80).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed2.setDescription(string)
            embeds.push(embed2)
        }
        if (votedArray.length > 80) {
            var string = ""

            votedArray.slice(80, 120).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed3.setDescription(string)
            embeds.push(embed3)
        }
        if (votedArray.length > 120) {
            var string = ""

            votedArray.slice(120, 160).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed4.setDescription(string)
            embeds.push(embed4)
        }
        if (votedArray.length > 160) {
            var string = ""

            votedArray.slice(160, 200).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed5.setDescription(string)
            embeds.push(embed5)
        }
        if (votedArray.length > 200) {
            var string = ""

            votedArray.slice(200, 240).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed6.setDescription(string)
            embeds.push(embed6)
        }
        if (votedArray.length > 240) {
            var string = ""

            votedArray.slice(240, 280).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed7.setDescription(string)
            embeds.push(embed7)
        }
        if (votedArray.length > 280) {
            var string = ""

            votedArray.slice(280, 320).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed8.setDescription(string)
            embeds.push(embed8)
        }
        if (votedArray.length > 320) {
            var string = ""

            votedArray.slice(320, 360).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            embed9.setDescription(string)
            embeds.push(embed9)
        }
        if (votedArray.length > 360) {
            var string = ""

            votedArray.slice(360, 400).forEach(member => {
                string += `• <@${member.user.id}> (${member.user.tag}) | **${member.amount}** vote streak | ${getRole(member.amount)}\n`
            })
            lastEmbed.setDescription(string)
            embeds.push(lastEmbed)
        }

        webhook.editMessage("942355029971578921", {
            content: null,
            embeds
        })
    }

    const updateDatabase = async (votedMembers) => {
        const DB = client.db.users
        const votedDb = await DB.find({ voted: true })

        votedDb.forEach(user => {
            if (!votedMembers.has(user.userId)) {
                user.voted = false
                user.voteAmount = 0
                user.save()
            }
        })

        votedMembers.forEach(async (member) => {
            await DB.findOneAndUpdate({
                userId: member.user.id
            }, {
                userId: member.user.id,
                voted: true,
                voteAmount: member.amount
            }, {
                upsert: true,
                new: true
            })
        })

    }


    setInterval(async () => {
        const votedMembers = await getVotedMembers()
        updateMemberRoles(votedMembers)
        updateVotedMessage(votedMembers)
        updateDatabase(votedMembers)
    }, 10000)
}