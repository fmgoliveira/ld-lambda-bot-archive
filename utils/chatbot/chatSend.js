const axios = require('axios');

const chatSend = async (message) => {
    try {
        let bid = process.env.BRAINSHOP_BID
        let key = process.env.BRAINSHOP_KEY
        let uid = "1"
        let msg = message.content
        message.channel.sendTyping()
        await axios.get(`http://api.brainshop.ai/get?bid=${bid}&key=${key}&uid=${uid}&msg=${msg}`)
            .then(res => {
                let data = res.data
                let reply = data.cnt
                if (reply) {
                    message.reply({
                        content: reply,
                        allowedMentions: {
                            repliedUser: false
                        }
                    })
                } else if (!reply) {
                    message.reply({
                        content: "API did not respond at time [TIME OUT]",
                        allowedMentions: {
                            repliedUser: false
                        }
                    })
                }
            })
    } catch (e) {
        console.log(e)
    }
};

module.exports = {
    chatSend
}
