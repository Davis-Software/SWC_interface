hljs.highlightAll()
document.querySelectorAll("*[href]").forEach(elem => {
    elem.addEventListener("click", e => {
        e.preventDefault()
        window.open(
            elem.href,
            "_blank"
        )
    })
})