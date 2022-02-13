const express = require("express")
const path = require("path")
const favicon = require("serve-favicon")
const passport = require("passport")
require("./strategies/discord")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const url = require("url")
const bodyParser = require("body-parser")
const placeholderReplace = require("../utils/placeholderReplace")

const PORT = process.env.PORT || 8080
const { WebhookClient, MessageEmbed, Permissions, Collection, MessageActionRow, MessageButton, UserManager } = require("discord.js")
const dataDir = path.join(process.cwd(), "dashboard").replaceAll("\\", "/")

const app = express()
app.set("view engine", "ejs")

module.exports = async (client) => {
    // Configuration
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    })

    app.use(favicon(dataDir + "/public/img/favicon1.png"))
    app.use("/css", express.static(dataDir + "/public/css"))
    app.use("/js", express.static(dataDir + "/public/js"))
    app.use("/images", express.static(dataDir + "/public/img"))
    app.use("/libs", express.static(dataDir + "/public/libs"))

    app.use(session({
        secret: 'asdasdasda7734r734753ererfretertdf43534wfefrrrr4awewdasdadadae',
        cookie: {
            maxAge: 60000 * 60 * 24
        },
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(bodyParser.urlencoded({ extended: true }))

    // Functions
    const checkAuth = async (req, res, next) => {
        if (req.isAuthenticated()) return next();
        req.session.backURL = req.url;
        res.redirect("/login");
    }

    const checkPerms = async (req, res, next) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")
        try {
            const member = await guild.members.fetch(req.user.id)
            if (!member) return res.redirect("/dashboard")
            if (!member.permissions.has("MANAGE_GUILD")) return res.redirect("/dashboard")
        } catch {
            return res.redirect("/dashboard")
        }
        return next()
    }


    const renderTemplate = (req, res, template, layout, data = {}) => {
        var hostname = req.headers.host
        var pathname = url.parse(req.url).pathname

        const baseData = {
            https: "https://",
            domain: process.env.DOMAIN,
            bot: client,
            hostname,
            pathname,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            url: res,
            req: req,
            image: `${process.env.DOMAIN}/img/favicon1.png`,
            name: client.username,
            tag: client.tag,
            template
        }
        res.render(`${dataDir}/templates/${layout}`, Object.assign(baseData, data, { data: Object.assign(baseData, data) }))
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Home Page
    app.get("/", (req, res) => {
        let memberCount = 0
        client.guilds.cache.forEach(guild => {
            if (guild.members.cache.has(client.user.id)) memberCount += guild.memberCount
        })

        let memberCountStr = String(memberCount)
        let guildCountStr = String(client.guilds.cache.size)

        let usersSuffix = ""
        let guildsSuffix = ""

        if (memberCountStr.length >= 4) {
            memberCountStr = `${memberCountStr.slice(0, -3)}`
            usersSuffix = "K+"
        }
        if (memberCountStr.length >= 7) {
            memberCountStr = `${memberCountStr.slice(0, -6)}`
            usersSuffix = "M+"
        }

        if (guildCountStr.length >= 4) {
            guildCountStr = `${guildCountStr.slice(0, -3)}`
            guildsSuffix = "K+"
        }
        if (guildCountStr.length >= 7) {
            guildCountStr = `${guildCountStr.slice(0, -6)}`
            guildsSuffix = "M+"
        }

        renderTemplate(req, res, null, "index", {
            users: memberCountStr,
            guilds: guildCountStr,
            usersSuffix,
            guildsSuffix
        })
    })

    // Login Page
    app.get("/login", (req, res, next) => {
        if (req.session.backURL) {
            req.session.backURL = req.session.backURL;
        } else {
            req.session.backURL = "/dashboard";
        }
        next();
    }, passport.authenticate("discord"))

    // Callback endpoint
    app.get("/callback", passport.authenticate("discord", {
        failWithError: true,
        failureFlash: "There was an error logging you in",
        failureRedirect: "/"
    }), async (req, res) => {
        const loginLogs = new WebhookClient({
            id: process.env.DASH_WEBHOOK_ID,
            token: process.env.DASH_WEBHOOK_TOKEN,
            url: process.env.DASH_WEBHOOK_URL
        })

        try {
            if (req.session.backURL) {
                const url = req.session.backURL
                req.session.backURL = null
                res.redirect(url)

                loginLogs.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("GREEN")
                            .setTitle("Login Log")
                            .setDescription("A user has logged in into his/her account")
                            .addField("User", `${req.user.username}#${req.user.discriminator} (\`${req.user.id}\`)`)
                            .addField("Time", `${new Date()}`)
                            .setFooter("Lambda Dashboard Logs", client.user.avatarURL())
                            .setTimestamp()
                    ]
                })
            } else {
                loginLogs.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("GREEN")
                            .setTitle("Login Log")
                            .setDescription("A user has logged in into his/her account")
                            .addField("User", `${req.user.username}#${req.user.discriminator} (\`${req.user.id}\`)`)
                            .addField("Time", `${new Date()}`)
                            .setFooter("Lambda Dashboard Logs", client.user.avatarURL())
                            .setTimestamp()
                    ]
                })

                res.redirect("/dashboard")
            }
        } catch (err) {
            console.log(err);
            res.redirect("/dashboard")
        }
    })

    // Logout endpoint
    app.get("/logout", async (req, res) => {
        const logoutLogs = new WebhookClient({
            id: process.env.DASH_WEBHOOK_ID,
            token: process.env.DASH_WEBHOOK_TOKEN,
            url: process.env.DASH_WEBHOOK_URL
        })

        if (req.user) {
            logoutLogs.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Logout Log")
                        .setDescription("A user has logged out from his/her account")
                        .addField("User", `${req.user.username}#${req.user.discriminator} (\`${req.user.id}\`)`)
                        .addField("Time", `${new Date()}`)
                        .setFooter("Lambda Dashboard Logs", client.user.avatarURL())
                        .setTimestamp()
                ]
            })
        }

        req.session.destroy(() => {
            req.logout()
            res.redirect("/")
        })
    })

    // Window endpoint
    app.get("/window", (req, res) => {
        renderTemplate(req, res, null, "window");
    })

    // Dashboard Pages
    app.get("/dashboard", checkAuth, (req, res) => {
        const server = client.guilds.cache.get(process.env.LAMBDA_GUILD_ID)
        let user = server.members.cache.has(req.user.id)

        renderTemplate(req, res, "menu", "menu", {
            perms: Permissions,
            userExists: user
        })
    })

    app.get("/dashboard/:guildId", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let bots = 0
        let humans = 0

        guild.members.cache.forEach(member => {
            if (member.user.bot) bots++
            else humans++
        })

        let botPercent = (bots * 226.19) / guild.memberCount
        let humanPercent = (humans * 226.19) / guild.memberCount

        let channelCount = 0
        let textChannels = 0
        let voiceChannels = 0

        guild.channels.cache.forEach(channel => {
            if (["GUILD_TEXT", "GUILD_NEWS"].includes(channel.type)) {
                channelCount++
                textChannels++
            } else if (["GUILD_VOICE", "GUILD_STAGE_VOICE"].includes(channel.type)) {
                channelCount++
                voiceChannels++
            }
        })

        let textChannelPercent = (textChannels * 226.19) / channelCount
        let voiceChannelPercent = (voiceChannels * 226.19) / channelCount

        let roleCount = 0
        let managedRoleCount = 0
        let createdRoleCount = 0

        guild.roles.cache.forEach(role => {
            if (role.botId || role.integrationId || role.premiumSubscriberRole) {
                externalRoleCount++
            } else {
                createdRoleCount++
            }
            roleCount++
        })

        let managedRolePercent = (managedRoleCount * 226.19) / roleCount
        let createdRolePercent = (createdRoleCount * 226.19) / roleCount

        const recentMembers = []
        const members = new Collection()

        guild.members.cache.forEach(member => {
            members.set(member.id, member)
        })

        for (let index = 0; index < 7; index++) {
            if (members.size > 0) {
                const member = members.reduce((prev, next) => (prev.createdAt > next.createdAt) ? prev : next)
                members.delete(member.id)
                recentMembers.push(member)
            }
        }

        const actions = await client.db.logs.find({ guildId: guild.id })
        const tempActions = actions
        const latestActions = []

        for (let index = 0; index < 3; index++) {
            if (tempActions.length > 0) {
                const action = tempActions.reduce((prev, next) => (prev.date > next.date) ? prev : next)
                const i = tempActions.indexOf(action)
                tempActions.splice(i, 1)
                latestActions.push(action)
            }
        }

        const join1 = []
        const join2 = []
        const leave1 = []
        const leave2 = []

        guild.members.cache.forEach(async (user) => {
            let day = 7 * 86400000
            let x = Date.now() - user.joinedAt
            let created = Math.floor(x / 86400000)

            if (7 > created) {
                join2.push(user.id)
            }
            if (1 > created) {
                join1.push(user.id)
            }
        })

        let storedSettings = await client.db.guilds.findOne({ guildId: guild.id })
        if (!storedSettings) storedSettings = await client.db.guilds.create({ guildId: guild.id })
        await storedSettings.save().catch(err => console.log(err))

        if (!storedSettings.leaves) storedSettings.leaves = []

        storedSettings.leaves.forEach(async (leave) => {
            let xx = leave - Date.now()

            if (Date.now() > leave) {
                xx = Date.now() - leave
            }

            let createdd = Math.floor(xx / 86400000)

            if (6 >= createdd) {
                leave2.push(leave)
            }
            if (0 >= created) {
                leave1.push(leave)
            }
        })

        renderTemplate(req, res, "home", "dashboard", {
            pageName: "Dashboard",
            guild,
            bots,
            humans,
            botPercent,
            humanPercent,
            channelCount,
            textChannels,
            voiceChannels,
            textChannelPercent,
            voiceChannelPercent,
            roleCount,
            managedRoleCount,
            createdRoleCount,
            managedRolePercent,
            createdRolePercent,
            recentMembers,
            actions,
            latestActions,
            join1,
            join2,
            leave1,
            leave2
        })
    })

    app.get("/dashboard/:guildId/members", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        renderTemplate(req, res, "members", "dashboard", {
            guild,
            pageName: "Members"
        })
    })

    app.get("/dashboard/:guildId/logs", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        const actions = await client.db.logs.find({ guildId: guild.id })

        renderTemplate(req, res, "logs", "dashboard", {
            guild,
            pageName: "Action Logs",
            actions
        })
    })

    app.get("/dashboard/:guildId/welcome", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const welcome = guildSettings.welcome
        const leave = guildSettings.leave
        const autorole = guildSettings.autorole

        renderTemplate(req, res, "welcome", "dashboard", {
            guild,
            pageName: "Welcome & Leave",
            welcome,
            leave,
            autorole
        })
    })

    app.get("/dashboard/:guildId/tickets", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const tickets = guildSettings.tickets

        const ticketPanels = await client.db.ticketPanels.find({ guildId: guild.id })

        renderTemplate(req, res, "tickets", "dashboard", {
            guild,
            pageName: "Tickets",
            tickets,
            ticketPanels
        })
    })

    app.get("/dashboard/:guildId/tickets/categories/:panelId", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")
        let panel
        try {
            panel = await client.db.ticketPanels.findById(req.params.panelId)
        } catch (err) {
            if (err.type === "CastError") return res.redirect(`/dashboard/${guild.id}/tickets`)
        }
        if (!panel) return res.redirect(`/dashboard/${guild.id}/tickets`)

        renderTemplate(req, res, "ticket-panels", "dashboard", {
            guild,
            pageName: "Ticket Category Edit",
            ticketPanel: panel
        })
    })

    app.get("/dashboard/:guildId/moderation", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const moderation = guildSettings.moderation
        const filter = guildSettings.filter

        renderTemplate(req, res, "moderation", "dashboard", {
            guild,
            pageName: "Moderation",
            moderation,
            filter
        })
    })

    app.get("/dashboard/:guildId/logging", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const logging = guildSettings.logging

        renderTemplate(req, res, "logging", "dashboard", {
            guild,
            pageName: "Logging",
            logging
        })
    })

    // app.get("/dashboard/:guildId/embeds", checkAuth, checkPerms, async (req, res) => {
    //     const guild = client.guilds.cache.get(req.params.guildId)
    //     if (!guild) return res.redirect("/dashboard")

    //     const guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

    //     renderTemplate(req, res, "embeds", "dashboard", {
    //         guild,
    //         pageName: "Embed Builder",
    //         guildSettings
    //     })
    // })

    // app.get("/dashboard/:guildId/embeds-iframe", checkAuth, checkPerms, async (req, res) => {
    //     const guild = client.guilds.cache.get(req.params.guildId)
    //     if (!guild) return res.redirect("/dashboard")

    //     const guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

    //     renderTemplate(req, res, "embeds-iframe", "embeds", {
    //         guild,
    //         pageName: "Embed Builder",
    //         guildSettings
    //     })
    // })

    // POST methods
    app.post("/dashboard/:guildId/welcome", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const alert = await welcomeValid(req.body, guildSettings, guild, req)

        renderTemplate(req, res, "welcome", "dashboard", {
            guild,
            pageName: "Welcome & Leave",
            welcome: guildSettings.welcome,
            leave: guildSettings.leave,
            autorole: guildSettings.autorole,
            alert
        })
    })

    app.post("/dashboard/:guildId/tickets", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const tickets = guildSettings.tickets

        let ticketPanels = await client.db.ticketPanels.find({ guildId: guild.id })
        const ticketPanelsDb = client.db.ticketPanels

        const alert = await ticketsValid(req.body, guildSettings, guild, req, ticketPanels, ticketPanelsDb)

        ticketPanels = await client.db.ticketPanels.find({ guildId: guild.id })

        renderTemplate(req, res, "tickets", "dashboard", {
            guild,
            pageName: "Tickets",
            tickets,
            ticketPanels,
            alert
        })
    })

    app.post("/dashboard/:guildId/tickets/categories/:panelId", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")
        let panel
        try {
            panel = await client.db.ticketPanels.findById(req.params.panelId).clone()
        } catch (err) {
            if (err.type === "CastError") return res.redirect(`/dashboard/${guild.id}/tickets`)
        }
        if (!panel) return res.redirect(`/dashboard/${guild.id}/tickets`)

        const guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        ticketsPanelValid(req.body, guildSettings, guild, req)

        res.redirect(`/dashboard/${req.params.guildId}/tickets`)
    })

    app.post("/dashboard/:guildId/moderation", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const moderation = guildSettings.moderation
        const filter = guildSettings.filter

        const alert = await moderationValid(req.body, guildSettings, guild, req)

        renderTemplate(req, res, "moderation", "dashboard", {
            guild,
            pageName: "Moderation",
            moderation,
            filter,
            alert
        })
    })

    app.post("/dashboard/:guildId/logging", checkAuth, checkPerms, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildId)
        if (!guild) return res.redirect("/dashboard")

        let guildSettings = await client.db.guilds.findOne({ guildId: guild.id })

        if (!guildSettings) {
            const newSettings = await client.db.guilds.create({ guildId: guild.id })
            await newSettings.save()
            guildSettings = newSettings
        }

        const logging = guildSettings.logging

        const alert = await loggingValid(req.body, guildSettings, guild, req)

        renderTemplate(req, res, "logging", "dashboard", {
            guild,
            pageName: "Logging",
            logging,
            alert
        })
    })

    // Auxiliar functions
    const welcomeValid = async (data, settings, guild, req) => {
        if (Object.prototype.hasOwnProperty.call(data, "welcomeSave")) {
            if (data.welcomeChannel !== "null" && data.welcomeChannel) {
                let welcomeChannelValid = await guild.channels.cache.find((ch) => ch.id === data.welcomeChannel)

                if (welcomeChannelValid) {
                    settings.welcome.channel = data.welcomeChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The welcome channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.welcomeChannel === "null") {
                    settings.welcome.channel = null
                    await settings.save()
                }
            }

            if (!data.welcomeActive) data.welcomeActive = false
            if (!data.welcomeEmbed) data.welcomeEmbed = false
            if (!data.welcomeDM) data.welcomeDM = false
            if (!data.welcomeChannel) data.welcomeChannel = settings.welcome.channel

            let welcomeEmbed = data.welcomeEmbed === "on" ? true : false

            if (!welcomeEmbed) {
                if (data.welcomeMessage.length <= 2000 && data.welcomeMessage.length > 0) {
                    settings.welcome.message = data.welcomeMessage
                    settings.welcome.embed.active = false
                    await settings.save()
                } else {
                    settings.welcome.embed.active = false
                    await settings.save()
                    return {
                        type: "danger",
                        msg: "The welcome message can't be empty nor have more than 2000 characters."
                    }
                }
            } else {
                const embed = {
                    active: true,
                    authorAvatar: data.welcomeEmbedAuthorAvatar,
                    author: data.welcomeEmbedAuthor,
                    authorUrl: data.welcomeEmbedAuthorUrl,
                    title: data.welcomeEmbedTitle,
                    titleUrl: data.welcomeEmbedTitleUrl,
                    description: data.welcomeEmbedDescription,
                    thumbnail: data.welcomeEmbedThumbnail,
                    image: data.welcomeEmbedImage,
                    footerIcon: data.welcomeEmbedFooterIcon,
                    footerText: data.welcomeEmbedFooterText,
                    color: data.welcomeEmbedColor
                }

                if (embed.author.length > 256) {
                    return {
                        type: "danger",
                        msg: "The welcome embed author can't have more than 256 characters."
                    }
                }
                if (embed.title.length > 256 || embed.title.length === 0) {
                    return {
                        type: "danger",
                        msg: "The welcome embed title must have between 1 and 256 characters."
                    }
                }
                if (embed.description.length > 4096) {
                    return {
                        type: "danger",
                        msg: "The welcome embed description can't have more than 4096 characters."
                    }
                }
                if (embed.footerText.length > 2048) {
                    return {
                        type: "danger",
                        msg: "The welcome embed footer text can't have more than 4096 characters."
                    }
                }
                if ((embed.author.length + embed.description.length + embed.footerText.length + embed.title.length) > 6000) {
                    return {
                        type: "danger",
                        msg: "The sum of all characters of the welcome embed must not exceed 6000."
                    }
                }

                settings.welcome.embed = embed
                await settings.save()
            }

            if (data.welcomeDM === "on") {
                settings.welcome.dm = true
                await settings.save()
            } else {
                settings.welcome.dm = false
                await settings.save()
            }

            if (data.welcomeActive === "on") {
                settings.welcome.active = true
                await settings.save()
            } else {
                settings.welcome.active = false
                await settings.save()
            }

            if (settings.welcome.active && !settings.welcome.channel) {
                return {
                    type: "warning",
                    msg: "The welcome channel is not set."
                }
            }

            if (!settings.welcome.active && !data.welcomeActive) {
                return {
                    type: "warning",
                    msg: "The welcome module is not enabled."
                }
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed welcome settings",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully updated the welcome module settings."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "leaveSave")) {
            if (data.leaveChannel !== "null" && data.leaveChannel) {
                let leaveChannelValid = await guild.channels.cache.find((ch) => ch.id === data.leaveChannel)

                if (leaveChannelValid) {
                    settings.leave.channel = data.leaveChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The leave channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.leaveChannel === "null") {
                    settings.leave.channel = null
                    await settings.save()
                }
            }

            if (!data.leaveActive) data.leaveActive = false
            if (!data.leaveEmbed) data.leaveEmbed = false
            if (!data.leaveDM) data.leaveDM = false
            if (!data.leaveChannel) data.leaveChannel = settings.leave.channel

            let leaveEmbed = data.leaveEmbed === "on" ? true : false

            if (!leaveEmbed) {
                if (data.leaveMessage.length <= 2000 && data.leaveMessage.length > 0) {
                    settings.leave.message = data.leaveMessage
                    settings.leave.embed.active = false
                    await settings.save()
                } else {
                    settings.leave.embed.active = false
                    await settings.save()
                    return {
                        type: "danger",
                        msg: "The leave message can't be empty nor have more than 2000 characters."
                    }
                }
            } else {
                const embed = {
                    active: true,
                    authorAvatar: data.leaveEmbedAuthorAvatar,
                    author: data.leaveEmbedAuthor,
                    authorUrl: data.leaveEmbedAuthorUrl,
                    title: data.leaveEmbedTitle,
                    titleUrl: data.leaveEmbedTitleUrl,
                    description: data.leaveEmbedDescription,
                    thumbnail: data.leaveEmbedThumbnail,
                    image: data.leaveEmbedImage,
                    footerIcon: data.leaveEmbedFooterIcon,
                    footerText: data.leaveEmbedFooterText,
                    color: data.leaveEmbedColor
                }

                if (embed.author.length > 256) {
                    return {
                        type: "danger",
                        msg: "The leave embed author can't have more than 256 characters."
                    }
                }
                if (embed.title.length > 256 || embed.title.length === 0) {
                    return {
                        type: "danger",
                        msg: "The leave embed title must have between 1 and 256 characters."
                    }
                }
                if (embed.description.length > 4096) {
                    return {
                        type: "danger",
                        msg: "The leave embed description can't have more than 4096 characters."
                    }
                }
                if (embed.footerText.length > 2048) {
                    return {
                        type: "danger",
                        msg: "The leave embed footer text can't have more than 4096 characters."
                    }
                }
                if ((embed.author.length + embed.description.length + embed.footerText.length + embed.title.length) > 6000) {
                    return {
                        type: "danger",
                        msg: "The sum of all characters of the leave embed must not exceed 6000."
                    }
                }

                settings.leave.embed = embed
                await settings.save()
            }

            if (data.leaveDM === "on") {
                settings.leave.dm = true
                await settings.save()
            } else {
                settings.leave.dm = false
                await settings.save()
            }

            if (data.leaveActive === "on") {
                settings.leave.active = true
                await settings.save()
            } else {
                settings.leave.active = false
                await settings.save()
            }

            if (settings.leave.active && !settings.leave.channel) {
                return {
                    type: "warning",
                    msg: "The leave channel is not set."
                }
            }

            if (!settings.leave.active && !data.leaveActive) {
                return {
                    type: "warning",
                    msg: "The leave module is not enabled."
                }
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed leave settings",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully updated the leave module settings."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "autoroleSave")) {
            if (data.autoroleId !== "null" && data.autoroleId) {
                let autoroleIdValid = await guild.roles.cache.find((ch) => ch.id === data.autoroleId)

                if (autoroleIdValid) {
                    settings.autorole.id = data.autoroleId
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The autorole role specified was not found on this guild."
                    }
                }
            } else {
                if (data.autoroleId === "null") {
                    settings.autorole.id = null
                    await settings.save()
                }
            }

            if (!data.autoroleActive) data.autoroleActive = false
            if (!data.autoroleId) data.autoroleId = settings.autorole.id

            if (data.autoroleActive === "on") {
                settings.autorole.active = true
                await settings.save()
            } else {
                settings.autorole.active = false
                await settings.save()
            }

            if (settings.autorole.active && !settings.autorole.id) {
                return {
                    type: "warning",
                    msg: "The autorole role is not set."
                }
            }

            if (!settings.autorole.active && !data.autoroleActive) {
                return {
                    type: "warning",
                    msg: "The autorole module is not enabled."
                }
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed autorole settings",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully updated the leave module settings."
            }
        }
    }

    const ticketsValid = async (data, settings, guild, req, ticketPanels, ticketPanelsDb) => {
        if (Object.prototype.hasOwnProperty.call(data, "ticketsSettingsSave")) {
            if (data.ticketsLogChannel !== "null" && data.ticketsLogChannel) {
                let ticketsLogChannelValid = await guild.channels.cache.find((ch) => ch.id === data.ticketsLogChannel)

                if (ticketsLogChannelValid) {
                    settings.tickets.logChannel = data.ticketsLogChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The tickets log channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.ticketsLogChannel === "null") {
                    settings.tickets.logChannel = null
                    await settings.save()
                }
            }

            if (!data.ticketsActive) data.ticketsActive = false

            if (data.ticketsActive === "on") {
                settings.tickets.active = true
                await settings.save()
            } else {
                settings.tickets.active = false
                await settings.save()
            }

            if (settings.tickets.active && !settings.tickets.panelMessage.channel) {
                return {
                    type: "warning",
                    msg: "The tickets panel is not set."
                }
            }

            if (!settings.tickets.active && !data.ticketsActive) {
                return {
                    type: "warning",
                    msg: "The tickets module is not enabled."
                }
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed ticket settings",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully updated the ticket module settings."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "ticketsPanelSend")) {
            if (!settings.tickets.active) {
                return {
                    type: "danger",
                    msg: "The tickets module is not enabled."
                }
            }

            if (data.ticketsPanelMessageChannel) {
                let ticketsPanelMessageChannelValid = await guild.channels.cache.find((ch) => ch.id === data.ticketsPanelMessageChannel)

                if (ticketsPanelMessageChannelValid) {
                    settings.tickets.panelMessage.channel = data.ticketsPanelMessageChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The ticket panel message channel specified was not found on this guild."
                    }
                }
            } else {
                return {
                    type: "danger",
                    msg: "You must select a channel to send the ticket panel."
                }
            }

            if (!data.ticketsPanelMessageTimestamp) data.ticketsPanelMessageTimestamp = false

            if (data.ticketsPanelMessageTitle === "") {
                data.ticketsPanelMessageTitle = "Open a ticket"
            }
            if (data.ticketsPanelMessageTitle.length > 256 || data.ticketsPanelMessageTitle.length === 0) {
                return {
                    type: "danger",
                    msg: "The panel message title must have between 1 and 256 characters."
                }
            }
            if (data.ticketsPanelMessageDescription === "") {
                data.ticketsPanelMessageDescription = "Click the button below to open a support ticket between you and the Support Team of {guild}."
            }
            if (data.ticketsPanelMessageDescription.length > 4096) {
                return {
                    type: "danger",
                    msg: "The panel message description can't have more than 4096 characters."
                }
            }

            settings.tickets.panelMessage.message.title = data.ticketsPanelMessageTitle
            settings.tickets.panelMessage.message.description = data.ticketsPanelMessageDescription
            settings.tickets.panelMessage.message.color = data.ticketsPanelMessageColor
            settings.tickets.panelMessage.message.timestamp = data.ticketsPanelMessageTimestamp === "on" ? true : false
            await settings.save()

            const embed = new MessageEmbed()
                .setTitle(settings.tickets.panelMessage.message.title)
                .setDescription(placeholderReplace(settings.tickets.panelMessage.message.description, guild))
                .setColor(settings.tickets.panelMessage.message.color)

            if (settings.tickets.panelMessage.message.timestamp) embed.setTimestamp()

            let components = null

            if (ticketPanels.length > 0) {
                components = new MessageActionRow()
                ticketPanels.forEach(panel => {
                    components.addComponents(
                        new MessageButton()
                            .setCustomId(`ticket-create-${panel._id}`)
                            .setLabel(panel.label)
                            .setEmoji("📨")
                            .setStyle("SECONDARY")
                    )
                })
            }

            guild.channels.cache.get(settings.tickets.panelMessage.channel).send({
                embeds: [embed],
                components: components ? [components] : null
            }).then(async (msg) => {
                settings.tickets.panelMessage.id = msg.id
                settings.tickets.panelMessage.url = msg.url
                await settings.save()
            }).catch(err => console.log(err))

            await client.db.logs.create({
                guildId: guild.id,
                action: "Sent a new ticket panel",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            if (ticketPanels.length === 0) {
                return {
                    type: "warning",
                    msg: "There aren't any ticket categories set yet."
                }
            }

            return {
                type: "success",
                msg: "Successfully sent the ticket panel."
            }

        } else if (Object.prototype.hasOwnProperty.call(data, "ticketsPanelSave")) {
            if (!settings.tickets.active) {
                return {
                    type: "danger",
                    msg: "The tickets module is not enabled."
                }
            }

            guild.channels.cache.get(settings.tickets.panelMessage.channel).messages.fetch(settings.tickets.panelMessage.id).then(msg => {
                msg.delete()
            }).catch(err => {
                if (err.message !== "Unknown Message") console.log(err)
            })

            if (data.ticketsPanelMessageChannel) {
                let ticketsPanelMessageChannelValid = await guild.channels.cache.find((ch) => ch.id === data.ticketsPanelMessageChannel)

                if (ticketsPanelMessageChannelValid) {
                    settings.tickets.panelMessage.channel = data.ticketsPanelMessageChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The ticket panel message channel specified was not found on this guild."
                    }
                }
            } else {
                data.ticketsPanelMessageChannel = settings.tickets.panelMessage.channel
            }

            if (!data.ticketsPanelMessageTimestamp) data.ticketsPanelMessageTimestamp = false

            if (data.ticketsPanelMessageTitle === "") {
                data.ticketsPanelMessageTitle = "Open a ticket"
            }
            if (data.ticketsPanelMessageTitle.length > 256 || data.ticketsPanelMessageTitle.length === 0) {
                return {
                    type: "danger",
                    msg: "The panel message title must have between 1 and 256 characters."
                }
            }
            if (data.ticketsPanelMessageDescription === "") {
                data.ticketsPanelMessageDescription = "Click the button below to open a support ticket between you and the Support Team of {guild}."
            }
            if (data.ticketsPanelMessageDescription.length > 4096) {
                return {
                    type: "danger",
                    msg: "The panel message description can't have more than 4096 characters."
                }
            }

            settings.tickets.panelMessage.message.title = data.ticketsPanelMessageTitle
            settings.tickets.panelMessage.message.description = data.ticketsPanelMessageDescription
            settings.tickets.panelMessage.message.color = data.ticketsPanelMessageColor
            settings.tickets.panelMessage.message.timestamp = data.ticketsPanelMessageTimestamp === "on" ? true : false
            await settings.save()

            const embed = new MessageEmbed()
                .setTitle(settings.tickets.panelMessage.message.title)
                .setDescription(placeholderReplace(settings.tickets.panelMessage.message.description, guild))
                .setColor(settings.tickets.panelMessage.message.color)

            if (settings.tickets.panelMessage.message.timestamp) embed.setTimestamp()

            let components = null

            if (ticketPanels.length > 0) {
                components = new MessageActionRow()
                ticketPanels.forEach(panel => {
                    components.addComponents(
                        new MessageButton()
                            .setCustomId(`ticket-create-${panel._id}`)
                            .setLabel(panel.label)
                            .setEmoji("📨")
                            .setStyle("SECONDARY")
                    )
                })
            }

            guild.channels.cache.get(settings.tickets.panelMessage.channel).send({
                embeds: [embed],
                components: components ? [components] : null
            }).then(async (msg) => {
                settings.tickets.panelMessage.id = msg.id
                settings.tickets.panelMessage.url = msg.url
                await settings.save()
            }).catch(err => console.log(err))

            await client.db.logs.create({
                guildId: guild.id,
                action: "Edited the ticket panel",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            if (ticketPanels.length === 0) {
                return {
                    type: "warning",
                    msg: "There aren't any ticket categories set yet."
                }
            }

            return {
                type: "success",
                msg: "Successfully edited the ticket panel."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "ticketsPanelDelete")) {
            guild.channels.cache.get(settings.tickets.panelMessage.channel).messages.fetch(settings.tickets.panelMessage.id).then(msg => {
                msg.delete()
            }).catch(err => {
                if (err.message !== "Unknown Message") console.log(err)
            })

            settings.tickets.panelMessage.channel = null
            settings.tickets.panelMessage.message.title = "Open a ticket"
            settings.tickets.panelMessage.message.description = "Click the button below to open a support ticket between you and the Support Team of {guild}."
            settings.tickets.panelMessage.message.color = "#000000"
            settings.tickets.panelMessage.message.timestamp = false
            await settings.save()

            await client.db.logs.create({
                guildId: guild.id,
                action: "Deleted the ticket panel",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully deleted the ticket panel."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "ticketPanelsAdd")) {
            if (ticketPanels.length === 5) {
                return {
                    type: "danger",
                    msg: "You can't create more than 5 ticket categories per server."
                }
            }

            if (data.ticketPanelsCategory) {
                let ticketPanelsCategoryValid = await guild.channels.cache.find((ch) => ch.id === data.ticketPanelsCategory)

                if (!ticketPanelsCategoryValid) {
                    return {
                        type: "danger",
                        msg: "The category specified was not found on this guild."
                    }
                }
            } else {
                return {
                    type: "danger",
                    msg: "You must select a category where the tickets of the category will be created."
                }
            }

            if (data.ticketPanelsSupportRole) {
                let ticketPanelsSupportRoleValid = await guild.roles.cache.find((ch) => ch.id === data.ticketPanelsSupportRole)

                if (!ticketPanelsSupportRoleValid) {
                    return {
                        type: "danger",
                        msg: "The role specified was not found on this guild."
                    }
                }
            } else {
                return {
                    type: "danger",
                    msg: "You must select the category support role."
                }
            }

            if (!data.ticketPanelsLabel) data.ticketPanelsLabel = "Open a ticket"
            if (!data.ticketPanelsEmoji) data.ticketPanelsEmoji = "🎫"
            if (!data.ticketsPanelsMaxTickets) data.ticketsPanelsMaxTickets = 0
            if (!data.ticketsPanelsWelcomeMessageMessage) data.ticketsPanelsWelcomeMessageMessage = "Hey {user}! Welcome to your ticket! Thank you for creating a ticket, the support team will be with you shortly. Meanwhile, please explain your issue below"

            if (data.ticketPanelsLabel.length > 80) {
                return {
                    type: "danger",
                    msg: "The button label can't have more than 80 characters."
                }
            }
            if (data.ticketsPanelsWelcomeMessageMessage.length > 4096) {
                return {
                    type: "danger",
                    msg: "The welcome message can't have more than 4096 characteres."
                }
            }

            await ticketPanelsDb.create({
                guildId: guild.id,
                category: data.ticketPanelsCategory,
                emoji: data.ticketPanelsEmoji,
                label: data.ticketPanelsLabel,
                maxTickets: data.ticketsPanelsMaxTickets,
                supportRole: data.ticketPanelsSupportRole,
                welcomeMessage: {
                    message: data.ticketsPanelsWelcomeMessageMessage,
                    color: data.ticketsPanelsWelcomeMessageColor
                }
            })

            ticketPanels = await client.db.ticketPanels.find({ guildId: guild.id })

            if (settings.tickets.panelMessage.channel) {
                guild.channels.cache.get(settings.tickets.panelMessage.channel).messages.fetch(settings.tickets.panelMessage.id).then(msg => {
                    msg.delete()
                }).catch(err => {
                    if (err.message !== "Unknown Message") console.log(err)
                })
            }

            const embed = new MessageEmbed()
                .setTitle(settings.tickets.panelMessage.message.title)
                .setDescription(placeholderReplace(settings.tickets.panelMessage.message.description, guild))
                .setColor(settings.tickets.panelMessage.message.color)

            if (settings.tickets.panelMessage.message.timestamp) embed.setTimestamp()

            let components = null

            if (ticketPanels.length > 0) {
                components = new MessageActionRow()
                ticketPanels.forEach(panel => {
                    components.addComponents(
                        new MessageButton()
                            .setCustomId(`ticket-create-${panel._id}`)
                            .setLabel(panel.label)
                            .setEmoji("📨")
                            .setStyle("SECONDARY")
                    )
                })
            }

            if (settings.tickets.panelMessage.channel) {
                guild.channels.cache.get(settings.tickets.panelMessage.channel).send({
                    embeds: [embed],
                    components: components ? [components] : null
                }).then(async (msg) => {
                    settings.tickets.panelMessage.id = msg.id
                    settings.tickets.panelMessage.url = msg.url
                    await settings.save()
                }).catch(err => console.log(err))
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Added a ticket category",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully added a ticket category."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "ticketPanelsDelete")) {
            const id = data.ticketPanelsSelected
            if (!id) return {
                type: "danger",
                msg: "Could not delete category. Please try again."
            }

            await ticketPanelsDb.findOneAndDelete({ _id: id })

            if (settings.tickets.panelMessage.channel) {
                guild.channels.cache.get(settings.tickets.panelMessage.channel).messages.fetch(settings.tickets.panelMessage.id).then(msg => {
                    msg.delete()
                }).catch(err => {
                    if (err.message !== "Unknown Message") console.log(err)
                })
            }

            ticketPanels = await client.db.ticketPanels.find({ guildId: guild.id })

            const embed = new MessageEmbed()
                .setTitle(settings.tickets.panelMessage.message.title)
                .setDescription(placeholderReplace(settings.tickets.panelMessage.message.description, guild))
                .setColor(settings.tickets.panelMessage.message.color)

            if (settings.tickets.panelMessage.message.timestamp) embed.setTimestamp()

            let components = null

            if (ticketPanels.length > 0) {
                components = new MessageActionRow()
                ticketPanels.forEach(panel => {
                    components.addComponents(
                        new MessageButton()
                            .setCustomId(`ticket-create-${panel._id}`)
                            .setLabel(panel.label)
                            .setEmoji("📨")
                            .setStyle("SECONDARY")
                    )
                })
            }

            if (settings.tickets.panelMessage.channel) {
                guild.channels.cache.get(settings.tickets.panelMessage.channel).send({
                    embeds: [embed],
                    components: components ? [components] : null
                }).then(async (msg) => {
                    settings.tickets.panelMessage.id = msg.id
                    settings.tickets.panelMessage.url = msg.url
                    await settings.save()
                }).catch(err => console.log(err))
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Removed a ticket category",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully deleted the ticket category."
            }
        }
    }

    const ticketsPanelValid = async (data, settings, guild, req) => {
        if (Object.prototype.hasOwnProperty.call(data, "ticketPanelEdit")) {
            let ticketPanelCategoryValid = await guild.channels.cache.find((ch) => ch.id === data.ticketPanelCategory)

            if (!ticketPanelCategoryValid && data.ticketPanelCategory) {
                return {
                    type: "danger",
                    msg: "The category specified was not found on this guild."
                }
            }

            let ticketPanelSupportRoleValid = await guild.roles.cache.find((ch) => ch.id === data.ticketPanelSupportRole)

            if (!ticketPanelSupportRoleValid && data.ticketPanelSupportRole) {
                return {
                    type: "danger",
                    msg: "The role specified was not found on this guild."
                }
            }

            if (!data.ticketPanelTitle) data.ticketPanelTitle = "Open a ticket"
            if (!data.ticketPanelMaxTickets) data.ticketPanelMaxTickets = 0
            if (!data.ticketPanelsWelcomeMessageMessage) data.ticketPanelsWelcomeMessageMessage = "Hey {user}! Welcome to your ticket! Thank you for creating a ticket, the support team will be with you shortly. Meanwhile, please explain your issue below"

            if (data.ticketPanelTitle.length > 80) {
                return {
                    type: "danger",
                    msg: "The button label can't have more than 80 characters."
                }
            }
            if (data.ticketPanelsWelcomeMessageMessage.length > 4096) {
                return {
                    type: "danger",
                    msg: "The welcome message can't have more than 4096 characteres."
                }
            }

            const category = await client.db.ticketPanels.findOne({ _id: req.params.panelId }).category
            const role = await client.db.ticketPanels.findOne({ _id: req.params.panelId }).supportRole

            client.db.ticketPanels.findOneAndUpdate({ _id: req.params.panelId }, {
                guildId: guild.id,
                category: data.ticketPanelCategory ? data.ticketPanelCategory : category,
                label: data.ticketPanelTitle,
                maxTickets: data.ticketPanelMaxTickets,
                supportRole: data.ticketPanelSupportRole ? data.ticketPanelSupportRole : role,
                welcomeMessage: {
                    message: data.ticketPanelsWelcomeMessageMessage,
                    color: data.ticketPanelWelcomeMessageColor
                }
            }, null, (err, docs) => console.log(err))

            ticketPanels = await client.db.ticketPanels.find({ guildId: guild.id })

            if (settings.tickets.panelMessage.channel) {
                guild.channels.cache.get(settings.tickets.panelMessage.channel).messages.fetch(settings.tickets.panelMessage.id).then(msg => {
                    msg.delete()
                }).catch(err => {
                    if (err.message !== "Unknown Message") console.log(err)
                })
            }

            const embed = new MessageEmbed()
                .setTitle(settings.tickets.panelMessage.message.title)
                .setDescription(placeholderReplace(settings.tickets.panelMessage.message.description, guild))
                .setColor(settings.tickets.panelMessage.message.color)

            if (settings.tickets.panelMessage.message.timestamp) embed.setTimestamp()

            let components = null

            if (ticketPanels.length > 0) {
                components = new MessageActionRow()
                ticketPanels.forEach(panel => {
                    components.addComponents(
                        new MessageButton()
                            .setCustomId(`ticket-create-${panel._id}`)
                            .setLabel(panel.label)
                            .setEmoji("📨")
                            .setStyle("SECONDARY")
                    )
                })
            }

            if (settings.tickets.panelMessage.channel) {
                guild.channels.cache.get(settings.tickets.panelMessage.channel).send({
                    embeds: [embed],
                    components: components ? [components] : null
                }).then(async (msg) => {
                    settings.tickets.panelMessage.id = msg.id
                    settings.tickets.panelMessage.url = msg.url
                    await settings.save()
                }).catch(err => console.log(err))
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Edited a ticket category",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully edited the ticket category."
            }
        }
    }

    const moderationValid = async (data, settings, guild, req) => {
        if (Object.prototype.hasOwnProperty.call(data, "moderationSave")) {
            if (data.moderatorRole !== "null" && data.moderatorRole !== "on" && data.moderatorRole) {
                let moderatorRoleValid = await guild.roles.cache.find((ch) => ch.id === data.moderatorRole)

                if (moderatorRoleValid) {
                    settings.moderation.moderatorRole = data.moderatorRole
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The moderator role specified was not found on this guild."
                    }
                }
            } else {
                if (data.moderatorRole === "null" || data.moderatorRole === "on") {
                    settings.moderation.moderatorRole = null
                    await settings.save()
                }
            }

            if (!data.moderationIncludeReason) data.moderationIncludeReason = false
            if (!data.moderationDmBan) data.moderationDmBan = false
            if (!data.moderationDmKick) data.moderationDmKick = false
            if (!data.moderationDmWarn) data.moderationDmWarn = false
            if (!data.moderationDmTimeout) data.moderationDmTimeout = false

            if (data.moderationIncludeReason === "on") {
                settings.moderation.includeReason = true
                await settings.save()
            } else {
                settings.moderation.includeReason = false
                await settings.save()
            }

            if (data.moderationDmBan === "on") {
                settings.moderation.dm.ban = true
                await settings.save()
            } else {
                settings.moderation.dm.ban = false
                await settings.save()
            }

            if (data.moderationDmKick === "on") {
                settings.moderation.dm.kick = true
                await settings.save()
            } else {
                settings.moderation.dm.kick = false
                await settings.save()
            }

            if (data.moderationDmWarn === "on") {
                settings.moderation.dm.warn = true
                await settings.save()
            } else {
                settings.moderation.dm.warn = false
                await settings.save()
            }

            if (data.moderationDmTimeout === "on") {
                settings.moderation.dm.timeout = true
                await settings.save()
            } else {
                settings.moderation.dm.timeout = false
                await settings.save()
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed moderation settings",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully updated the moderation module settings."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "filterSave")) {
            console.log(data)
            if (data.filterChannel !== "null" && data.filterChannel !== "on" && data.filterChannel) {
                let filterChannelValid = await guild.channels.cache.find((ch) => ch.id === data.filterChannel)

                if (filterChannelValid) {
                    settings.filter.filterChannel = data.filterChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The log channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.filterChannel === "null" || data.filterChannel === "on") {
                    settings.filter.filterChannel = null
                    await settings.save()
                }
            }

            if (!data.filterActive) data.filterActive = false

            if (data.filterActive === "on") {
                settings.filter.active = true
                await settings.save()
            } else {
                settings.filter.active = false
                await settings.save()
            }

            if (data.filterWords) {
                settings.filter.words = data.filterWords.split(" ")
                await settings.save()
            }

            if (!data.filterActive && (data.filterChannel || data.filterWords)) return {
                type: "warning",
                msg: "The chat filter module is not enabled."
            }

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed chat filter settings",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            return {
                type: "success",
                msg: "Successfully updated the chat filter module settings."
            }
        }
    }

    const loggingValid = async (data, settings, guild, req) => {
        if (Object.prototype.hasOwnProperty.call(data, "moderationSave")) {
            if (data.moderationChannel !== "null" && data.moderationChannel !== "on" && data.moderationChannel) {
                let moderationChannelValid = await guild.channels.cache.find((ch) => ch.id === data.moderationChannel)

                if (moderationChannelValid) {
                    settings.logging.channel.moderation = data.moderationChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The logging channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.moderationChannel === "null" || data.moderationChannel === "on") {
                    settings.logging.channel.moderation = null
                    await settings.save()
                }
            }

            if (!data.ban) data.ban = false
            if (!data.kick) data.kick = false
            if (!data.clear) data.clear = false
            if (!data.warn) data.warn = false
            if (!data.timeout) data.timeout = false
            if (!data.slowmode) data.slowmode = false

            if (data.ban === "on") {
                settings.logging.active.moderation.ban = true
                await settings.save()
            } else {
                settings.logging.active.moderation.ban = false
                await settings.save()
            }

            if (data.kick === "on") {
                settings.logging.active.moderation.kick = true
                await settings.save()
            } else {
                settings.logging.active.moderation.kick = false
                await settings.save()
            }

            if (data.clear === "on") {
                settings.logging.active.moderation.clear = true
                await settings.save()
            } else {
                settings.logging.active.moderation.clear = false
                await settings.save()
            }

            if (data.warn === "on") {
                settings.logging.active.moderation.warn = true
                await settings.save()
            } else {
                settings.logging.active.moderation.warn = false
                await settings.save()
            }

            if (data.timeout === "on") {
                settings.logging.active.moderation.timeout = true
                await settings.save()
            } else {
                settings.logging.active.moderation.timeout = false
                await settings.save()
            }

            if (data.slowmode === "on") {
                settings.logging.active.moderation.slowmode = true
                await settings.save()
            } else {
                settings.logging.active.moderation.slowmode = false
                await settings.save()
            }

            settings.logging.color.moderation = data.moderationColor
            await settings.save()

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed logging settings; category: moderation",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            if (!data.moderationChannel) {
                if (!settings.logging.channel.moderation) return {
                    type: "warning",
                    msg: "There isn't any logging channel specified."
                }
            }

            return {
                type: "success",
                msg: "Successfully updated the logging settings; category: moderation."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "serverEventsSave")) {
            if (data.serverEventsChannel !== "null" && data.serverEventsChannel !== "on" && data.serverEventsChannel) {
                let serverEventsChannelValid = await guild.channels.cache.find((ch) => ch.id === data.serverEventsChannel)

                if (serverEventsChannelValid) {
                    settings.logging.channel.serverEvents = data.serverEventsChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The logging channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.serverEventsChannel === "null" || data.serverEventsChannel === "on") {
                    settings.logging.channel.serverEvents = null
                    await settings.save()
                }
            }

            if (!data.channelCreate) data.channelCreate = false
            if (!data.channelDelete) data.channelDelete = false
            if (!data.roleCreateDelete) data.roleCreateDelete = false
            if (!data.guildUpdate) data.guildUpdate = false
            if (!data.joinVoiceChannel) data.joinVoiceChannel = false
            if (!data.moveVoiceChannel) data.moveVoiceChannel = false
            if (!data.leaveVoiceChannel) data.leaveVoiceChannel = false

            if (data.channelCreate === "on") {
                settings.logging.active.serverEvents.channelCreate = true
                await settings.save()
            } else {
                settings.logging.active.serverEvents.channelCreate = false
                await settings.save()
            }

            if (data.channelDelete === "on") {
                settings.logging.active.serverEvents.channelDelete = true
                await settings.save()
            } else {
                settings.logging.active.serverEvents.channelDelete = false
                await settings.save()
            }

            if (data.roleCreateDelete === "on") {
                settings.logging.active.serverEvents.roleCreateDelete = true
                await settings.save()
            } else {
                settings.logging.active.serverEvents.roleCreateDelete = false
                await settings.save()
            }

            if (data.guildUpdate === "on") {
                settings.logging.active.serverEvents.guildUpdate = true
                await settings.save()
            } else {
                settings.logging.active.serverEvents.guildUpdate = false
                await settings.save()
            }

            if (data.joinVoiceChannel === "on") {
                settings.logging.active.serverEvents.joinVoiceChannel = true
                await settings.save()
            } else {
                settings.logging.active.serverEvents.joinVoiceChannel = false
                await settings.save()
            }

            if (data.moveVoiceChannel === "on") {
                settings.logging.active.serverEvents.moveVoiceChannel = true
                await settings.save()
            } else {
                settings.logging.active.serverEvents.moveVoiceChannel = false
                await settings.save()
            }

            if (data.leaveVoiceChannel === "on") {
                settings.logging.active.serverEvents.leaveVoiceChannel = true
                await settings.save()
            } else {
                settings.logging.active.serverEvents.leaveVoiceChannel = false
                await settings.save()
            }

            settings.logging.color.serverEvents = data.serverEventsColor || "#000000"
            await settings.save()

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed logging settings; category: server events",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            if (!data.serverEventsChannel) {
                if (!settings.logging.channel.serverEvents) return {
                    type: "warning",
                    msg: "There isn't any logging channel specified."
                }
            }

            return {
                type: "success",
                msg: "Successfully updated the logging settings; category: server events."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "memberEventsSave")) {
            if (data.memberEventsChannel !== "null" && data.memberEventsChannel !== "on" && data.memberEventsChannel) {
                let memberEventsChannelValid = await guild.channels.cache.find((ch) => ch.id === data.memberEventsChannel)

                if (memberEventsChannelValid) {
                    settings.logging.channel.memberEvents = data.memberEventsChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The logging channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.memberEventsChannel === "null" || data.memberEventsChannel === "on") {
                    settings.logging.channel.memberEvents = null
                    await settings.save()
                }
            }

            if (!data.memberJoin) data.memberJoin = false
            if (!data.memberLeave) data.memberLeave = false
            if (!data.rolesUpdate) data.rolesUpdate = false
            if (!data.nicknameUpdate) data.nicknameUpdate = false

            if (data.memberJoin === "on") {
                settings.logging.active.memberEvents.memberJoin = true
                await settings.save()
            } else {
                settings.logging.active.memberEvents.memberJoin = false
                await settings.save()
            }

            if (data.memberLeave === "on") {
                settings.logging.active.memberEvents.memberLeave = true
                await settings.save()
            } else {
                settings.logging.active.memberEvents.memberLeave = false
                await settings.save()
            }

            if (data.rolesUpdate === "on") {
                settings.logging.active.memberEvents.rolesUpdate = true
                await settings.save()
            } else {
                settings.logging.active.memberEvents.rolesUpdate = false
                await settings.save()
            }

            if (data.nicknameUpdate === "on") {
                settings.logging.active.memberEvents.nicknameUpdate = true
                await settings.save()
            } else {
                settings.logging.active.memberEvents.nicknameUpdate = false
                await settings.save()
            }

            settings.logging.color.memberEvents = data.memberEventsColor
            await settings.save()

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed logging settings; category: member events",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            if (!data.memberEventsChannel) {
                if (!settings.logging.channel.memberEvents) return {
                    type: "warning",
                    msg: "There isn't any logging channel specified."
                }
            }

            return {
                type: "success",
                msg: "Successfully updated the logging settings; category: member events."
            }
        } else if (Object.prototype.hasOwnProperty.call(data, "messageEventsSave")) {
            if (data.messageEventsChannel !== "null" && data.messageEventsChannel !== "on" && data.messageEventsChannel) {
                let messageEventsChannelValid = await guild.channels.cache.find((ch) => ch.id === data.messageEventsChannel)

                if (messageEventsChannelValid) {
                    settings.logging.channel.messageEvents = data.messageEventsChannel
                    await settings.save()
                } else {
                    return {
                        type: "danger",
                        msg: "The logging channel specified was not found on this guild."
                    }
                }
            } else {
                if (data.messageEventsChannel === "null" || data.messageEventsChannel === "on") {
                    settings.logging.channel.messageEvents = null
                    await settings.save()
                }
            }

            if (!data.messageDelete) data.messageDelete = false
            if (!data.messageEdit) data.messageEdit = false

            if (data.messageDelete === "on") {
                settings.logging.active.messageEvents.messageDelete = true
                await settings.save()
            } else {
                settings.logging.active.messageEvents.messageDelete = false
                await settings.save()
            }

            if (data.messageEdit === "on") {
                settings.logging.active.messageEvents.messageEdit = true
                await settings.save()
            } else {
                settings.logging.active.messageEvents.messageEdit = false
                await settings.save()
            }

            settings.logging.color.messageEvents = data.messageEventsColor
            await settings.save()

            await client.db.logs.create({
                guildId: guild.id,
                action: "Changed logging settings; category: message events",
                date: Date.now(),
                user: {
                    id: req.user.id,
                    username: guild.members.cache.get(req.user.id).user.username,
                    tag: guild.members.cache.get(req.user.id).user.tag,
                    avatar: guild.members.cache.get(req.user.id).user.avatar
                }
            })

            if (!data.messageEventsChannel) {
                if (!settings.logging.channel.messageEvents) return {
                    type: "warning",
                    msg: "There isn't any logging channel specified."
                }
            }

            return {
                type: "success",
                msg: "Successfully updated the logging settings; category: message events."
            }
        }
    }

    // Wiki redirects
    app.get("/docs", (req, res) => {
        res.redirect("https://wiki.lambdadev.xyz/bot")
    })
    app.get("/commands", (req, res) => {
        res.redirect("https://wiki.lambdadev.xyz/bot/commands")
    })
    app.get("/faq", (req, res) => {
        res.redirect("https://wiki.lambdadev.xyz/bot/faq")
    })
    app.get("/placeholders", (req, res) => {
        res.redirect("https://wiki.lambdadev.xyz/bot/dashboard/placeholders")
    })
    // app.get("/embeds", (req, res) => {
    //     res.redirect("https://wiki.lambdadev.xyz/bot/embeds")
    // })
    app.get("/policy", (req, res) => {
        res.redirect("https://wiki.lambdadev.xyz/legal/policy")
    })

    // Other external links redirects
    app.get("/support", (req, res) => {
        res.redirect(process.env.LAMBDA_GUILD_LINK)
    })
    app.get("/server", (req, res) => {
        res.redirect("process.env.LAMBDA_GUILD_LINK")
    })
    app.get("/discord", (req, res) => {
        res.redirect("process.env.LAMBDA_GUILD_LINK")
    })
    app.get("/invite", (req, res) => {
        res.redirect("https://discord.com/api/oauth2/authorize?client_id=900398063607242762&permissions=1118741982327&redirect_uri=https%3A%2F%2Fdiscord.gg%2FzqBF8Wv5Pg&response_type=code&scope=bot%20applications.commands")
    })

    // Bot Lists API Webhooks
    app.post("/discordswebhook", bodyParser.json(), async (req, res) => {
        if (!req.headers.authorization || (req.headers.authorization !== process.env.BOTSFORDISCORD_WEBHOOK_TOKEN)) return res.sendStatus(403)
        res.sendStatus(200)

        if (!req.body) return

        const { user, bot } = req.body

        if (bot !== process.env.APPLICATION_ID) return
        const timestamp = Date.now()

        await client.db.votes.create({
            userId: user,
            timestamp,
            list: "botsfordiscord"
        })
    })

    app.post("/dblwebhook", bodyParser.json(), async (req, res) => {
        if (!req.headers.authorization || (req.headers.authorization !== process.env.TOP_GG_WEBHOOK_TOKEN)) return res.sendStatus(403)
        res.sendStatus(200)

        if (!req.body) return

        const { user, bot, type } = req.body

        if (bot !== process.env.APPLICATION_ID) return
        if (type === "test") return
        const timestamp = Date.now()

        await client.db.votes.create({
            userId: user,
            timestamp,
            list: "topgg"
        })
    })

    app.listen(PORT, () => console.log(`🌐 Webserver started at port ${PORT} successfully`))
}
