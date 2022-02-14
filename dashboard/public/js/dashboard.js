const sideMenu = document.querySelector("aside")
const menuBtn = document.querySelector("#menu-btn")
const closeBtn = document.querySelector("#close-btn")
const themeToggler = document.querySelector(".theme-toggler")
const lightBtn = themeToggler.querySelector("span:nth-child(1)")
const darkBtn = themeToggler.querySelector("span:nth-child(2)")

menuBtn.addEventListener("click", () => {
    sideMenu.style.left = "0"
})

closeBtn.addEventListener("click", () => {
    sideMenu.style.left = "-100%"
})

const selectedTheme = localStorage.getItem('selected-theme')
const getCurrentTheme = () => document.body.classList.contains("dark-theme-variables") ? 'dark' : 'light'
const getCurrentIcon = () => lightBtn.classList.contains("active") ? "light" : "dark"

if (selectedTheme) {
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove']("dark-theme-variables")
    lightBtn.classList[selectedTheme === "light" ? "remove" : "add"]("active")
    darkBtn.classList[selectedTheme === "dark" ? "remove" : "add"]("active")
}

themeToggler.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme-variables")
    lightBtn.classList.toggle("active")
    darkBtn.classList.toggle("active")
    localStorage.setItem('selected-theme', getCurrentTheme())
})

const links = sideMenu.querySelectorAll("a")
const path = window.location.pathname.split("/")
const pageUrl = path[3]
const possiblePaths = [
    "members",
    "logs",
    "welcome",
    "tickets",
    "moderation",
    "alt-detector",
    "logging",
    "reaction-roles",
    "embeds",
    "verification"
]

links.forEach(link => {
    if (link.classList.contains(possiblePaths.includes(pageUrl) ? pageUrl : "home")) link.classList.add("active")
    else link.classList.remove("active")
})

function copyId(elem) {
    const userId = elem
    const span = userId.querySelector("span")
    
    const text = userId.innerHTML.substring(4).split(" <")[0]
    navigator.clipboard.writeText(text).then(() => {
        span.innerHTML = "library_add_check"
        setTimeout(() => {
            span.innerHTML = "content_copy"
        }, 4000)
    })
}