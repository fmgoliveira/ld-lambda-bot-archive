const passport = require("passport")
const DiscordStrategy = require("passport-discord")

passport.serializeUser((user, done) => done(null, user))

passport.deserializeUser((obj, done) => done(null, obj))

passport.use(new DiscordStrategy({
    clientID: process.env.APPLICATION_ID,
    clientSecret: process.env.APPLICATION_SECRET,
    callbackURL: `${process.env.DOMAIN}/callback`,
    scope: ["identify", "guilds"]
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));