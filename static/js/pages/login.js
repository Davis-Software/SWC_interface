{
    document.querySelector("form").addEventListener("submit", e => {
        let button = e.target.querySelector("button")
        button.setAttribute("disabled", null)
        button.innerHTML = "<div class='spinner-border'></div>"
    })
}