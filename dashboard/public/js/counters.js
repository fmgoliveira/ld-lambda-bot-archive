function updateCounters() {
    const req = new XMLHttpRequest()
    req.open("GET", "https://lambda-discordbot.herokuapp.com/", true)
    req.send(null)

    req.onreadystatechange = () => {
        const list = req.responseText.split(" | ")

        const guilds = document.querySelector("h2.guilds")
        const channels = document.querySelector("h2.channels")
        const members = document.querySelector("h2.members")
        const commands = document.querySelector("h2.commands")

        guilds.innerHTML = list[0]
        channels.innerHTML = list[1]
        members.innerHTML = list[2]
        commands.innerHTML = "35+"
    }
}