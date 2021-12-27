const { MessageActionRow, MessageButton } = require("discord.js")

module.exports = (verifyDisabled = false, resolvedDisabled = true, onHoldDisabled = true, wontFixDisabled = true) => {
    const Menu1 = new MessageActionRow().addComponents(
        new MessageButton()
            .setEmoji("✅")
            .setLabel("Verify")
            .setStyle("SUCCESS")
            .setCustomId("bug-verify")
            .setDisabled(verifyDisabled),
        new MessageButton()
            .setEmoji("🗑️")
            .setLabel("Delete")
            .setStyle("DANGER")
            .setCustomId("bug-delete")
    )

    const Menu2 = new MessageActionRow().addComponents([
        new MessageButton()
            .setEmoji("<:status_green:906087473627668490>")
            .setLabel("Mark as 'Resolved'")
            .setStyle("SECONDARY")
            .setCustomId("bug-resolve")
            .setDisabled(resolvedDisabled),
        new MessageButton()
            .setEmoji("<:status_yellow:906087532356304906>")
            .setLabel("Mark as 'On Hold'")
            .setStyle("SECONDARY")
            .setCustomId("bug-onhold")
            .setDisabled(onHoldDisabled),
        new MessageButton()
            .setEmoji("<:status_red:906087602447335424>")
            .setLabel("Mark as 'Won't Fix'")
            .setStyle("SECONDARY")
            .setCustomId("bug-wontfix")
            .setDisabled(wontFixDisabled)
    ])

    return [Menu1, Menu2]
}