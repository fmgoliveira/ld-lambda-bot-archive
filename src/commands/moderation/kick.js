const { MessageEmbed } = require("discord.js")
const Command = require("../../structures/Command")

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "kick",
            description: "Kicks an user from the server.",
            options: [
                {
                    name: "user",
                    type: "USER",
                    description: "The user you want to kick from the server.",
                    required: true
                },
                {
                    name: "reason",
                    type: "STRING",
                    description: "The reason why you want to kick the user from the server.",
                    required: false
                }
            ],
            category: "moderation"
        })
    }

    run = (message) => {
        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Soon...")
                    .setThumbnail(this.client.user.avatarURL())
                    .setTimestamp()
                    .setFooter(this.client.user.username, this.client.user.avatarURL())
            ]
        })

        if (!message.member.permissions.has('KICK_MEMBERS')) return message.reply({ content: 'Você precisa de permissão para expulsar membros no servidor.', ephemeral: true })

        const user = message.options.getUser('usuário')
        if (message.user.id === user.id) return message.reply({ content: 'Você não pode se expulsar.', ephemeral: true })

        const member = message.guild.members.cache.get(user.id)
        if (member.roles.highest.position >= message.member.roles.highest.position) return message.reply({ content: 'Você só pode expulsar membros com cargo abaixo do seu.', ephemeral: true })
        if (message.guild.me.roles.highest.position <= member.roles.highest.position) return message.reply({ content: 'Não consigo expulsar este usuário, o cargo dele não é mais baixo que o meu.', ephemeral: true })

        const reason = message.options.getString('motivo') || 'Motivo não especificado.'

        message.guild.members.ban(user, { reason })
            .then(() => message.reply({ content: `Usuário \`${user.tag}\` expulso com sucesso!`, ephemeral: true }))
            .catch(() => message.reply({ content: 'Erro ao expulsar o usuário!', ephemeral: true }))
    }
}