const welcomeEmbedSlider = document.querySelector(".switch2 input")
const leaveEmbedSlider = document.querySelector(".switch4 input")
const welcomeMessage = document.querySelector(".welcomeMessage")
const welcomeEmbed = document.querySelector(".welcomeEmbed")
const leaveMessage = document.querySelector(".leaveMessage")
const leaveEmbed = document.querySelector(".leaveEmbed")

welcomeEmbedSlider.addEventListener("change", (e) => {
    if (e.target.checked) {
        welcomeMessage.classList.remove("active")
        welcomeEmbed.classList.add("active")
    } else {
        welcomeMessage.classList.add("active")
        welcomeEmbed.classList.remove("active")
    }
})

leaveEmbedSlider.addEventListener("change", (e) => {
    if (e.target.checked) {
        leaveMessage.classList.remove("active")
        leaveEmbed.classList.add("active")
    } else {
        leaveMessage.classList.add("active")
        leaveEmbed.classList.remove("active")
    }
})