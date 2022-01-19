const box = document.querySelector(".alert")
const boxCloseBtn = box.querySelector(".close")

boxCloseBtn.addEventListener("click", () => {
    box.style.display = "none"
    clearInterval(id)
    i = 100
})

const progress = box.querySelector(".progress")
const progressBar = progress.querySelector(".bar")

var i = 100
if (i === 100) {
    i = 99
    var width = 99
    var id = setInterval(() => {
        if (width <= 0) {
            clearInterval(id)
            i = 100
            box.style.display = "none"
        } else {
            width--
            progressBar.style.width = width + "%"
        }
    }, 60)
}
