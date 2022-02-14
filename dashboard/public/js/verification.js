const verificationEmbedSlider = document.querySelector(".switch785 input")
const verificationMessage = document.querySelector(".verificationMessage")
const verificationEmbed = document.querySelector(".verificationEmbed")

verificationEmbedSlider.addEventListener("change", (e) => {
    if (e.target.checked) {
        verificationMessage.classList.remove("active")
        verificationEmbed.classList.add("active")
    } else {
        verificationMessage.classList.add("active")
        verificationEmbed.classList.remove("active")
    }
})