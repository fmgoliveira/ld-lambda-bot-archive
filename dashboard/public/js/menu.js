const themeToggler = document.querySelector(".theme-toggler")
const lightBtn = themeToggler.querySelector("span:nth-child(1)")
const darkBtn = themeToggler.querySelector("span:nth-child(2)")

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