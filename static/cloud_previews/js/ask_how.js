let c_btn = document.querySelector(".btn-primary")
document.querySelectorAll(".list-group-item.list-group-item-action").forEach(elem => {
    elem.addEventListener("click", _ => {
        elem.parentElement.querySelectorAll(".list-group-item-action").forEach(e => {
            e.classList.remove("active")
        })
        elem.classList.add("active")
        c_btn.disabled = false
    })
})
c_btn.addEventListener("click", _ => {
    c_btn.disabled = true
    let selected = document.querySelector(".list-group-item.list-group-item-action.active")
    setCookie("set-file-type-open", "yes", 1)
    setCookie("set-file-type-file", selected.getAttribute("data-type"), 1)
    location.reload()
})