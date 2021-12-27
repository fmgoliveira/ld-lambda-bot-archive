const { MessageActionRow, MessageButton } = require("discord.js")

module.exports = class extends MessageActionRow {
    constructor() {
        super()

        this.addComponents(
            new MessageButton()
                .setEmoji("<:logo:921033010764218428>")
                .setLabel("Support Server")
                .setURL(process.env.SERVER_LINK)
                .setStyle("LINK")
        )
    }
}