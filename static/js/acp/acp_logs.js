document.querySelectorAll("#tab-selector a").forEach(elem => {
    elem.addEventListener("click", _ => {
        let sel = document.querySelector(elem.getAttribute("href"))
        sel.innerHTML = `
            <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `
        fetch(`?get_log=${elem.getAttribute("data-tab")}`).then(resp => {
            if(!resp.ok) return
            resp.text().then(text => {
                sel.innerText = text
            })
        })
    })
})