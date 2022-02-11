const { CommandInteraction, Client, MessageEmbed } = require("discord.js")

module.exports = {
    name: "serverinfo",
    description: "Show some info about this server.",
    category: "utility",
    /**
    * 
    * @param { CommandInteraction } interaction
    * @param { Client } client
    */
    execute(interaction, client) {
        const { guild } = interaction
        const { name, id, createdTimestamp, ownerId, description, members, channels, emojis, stickers, roles } = guild

        const embed = new MessageEmbed()
            .setColor(client.color)
            .setAuthor({ name: name, iconURL: guild.iconURL({ dynamic: true }) })
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                {
                    name: `General`,
                    value: `**Name:** ${name}\n**ID:** ${id}\n**Created:** <t:${parseInt(createdTimestamp / 1000)}:R>\n**Owner:** <@${ownerId}>\n**Description:** ${description}\n\n_ _`
                },
                {
                    name: `Members`,
                    value: `\`\`\`swift\nHumans     ${members.cache.filter(m => !m.user.bot).size}\nBots       ${members.cache.filter(m => m.user.bot).size}\n\n\n\n\n\nTOTAL      ${members.cache.size}\n\`\`\``,
                    inline: true
                },
                {
                    name: `Channels`,
                    value: `\`\`\`swift\nText       ${channels.cache.filter(c => c.type === "GUILD_TEXT").size}\nVoice      ${channels.cache.filter(c => c.type === "GUILD_VOICE").size}\nThreads    ${channels.cache.filter(c => c.type === "GUILD_PUBLIC_THREAD" && "GUILD_PRIVATE_THREAD" && "GUILD_NEWS_THREAD").size}\nCategories ${channels.cache.filter(c => c.type === "GUILD_CATEGORY").size}\nStage      ${channels.cache.filter(c => c.type === "GUILD_STAGE_VOICE").size}\nNews       ${channels.cache.filter(c => c.type === "GUILD_NEWS").size}\n\nTOTAL      ${channels.cache.size}\n\`\`\``,
                    inline: true
                },
                {
                    name: `Emojis & Stickers`,
                    value: `\`\`\`swift\nAnimated   ${emojis.cache.filter(e => e.animated).size}\nStatic     ${emojis.cache.filter(e => !e.animated).size}\nStickers   ${stickers.cache.size}\n\n\n\n\nTOTAL      ${emojis.cache.size + stickers.cache.size}\n\`\`\``,
                    inline: true
                },
                {
                    name: `Roles`,
                    value: `\`\`\`swift\nNon Admin Roles ${roles.cache.filter(r => !r.permissions.has("ADMINISTRATOR")).size}\nAdmin Roles     ${roles.cache.filter(r => r.permissions.has("ADMINISTRATOR")).size}\n\nTOTAL           ${roles.cache.size}\n\`\`\``,
                    inline: true
                },
                {
                    name: `Nitro Statistics`,
                    value: `\`\`\`swift\nPremium Tier    ${guild.premiumTier === "NONE" ? 0 : guild.premiumTier.replace("TIER_", "")}\n\nBoosts          ${guild.premiumSubscriptionCount}\nBoosters        ${members.cache.filter(m => m.premiumSince).size}\n\`\`\``,
                    inline: true
                }
            )
            .setFooter(client.footer)

        interaction.reply({ embeds: [embed] })
    }
}