function set_elem(elem){
    document.querySelector("#console").appendChild(elem)
    document.querySelector("#console-container").scrollTop = document.querySelector("#console-container").scrollHeight
}

document.querySelector("button#exc-cmd").addEventListener("click", _ => {
    let cmd = document.querySelector("input[name=cmd]").value
    let form = new FormData()
    form.append("exc_cmd", cmd)
    fetch("", {
        method: "POST",
        body: form
    }).then(resp => {
        let elem = document.createElement("li")
        if(!resp.ok){
            elem.innerText = `Error: ${resp.status} - ${resp.statusText}`
            elem.classList.add("text-danger")
            set_elem(elem)
        }else{
            resp.json().then(json => {
                let state = json.data.exc_code
                let text = json.data.output
                if(text === "\f"){
                    document.querySelector("#console").innerHTML = ""
                }else{
                    elem.innerText = `${text} --- ${state} ---`
                    set_elem(elem)
                }
            })
        }
        sessionStorage.setItem("acp-cmd-history", cmd)
        document.querySelector("input[name=cmd]").value = ""
    })
})

document.querySelector("input[name=cmd]").addEventListener("keydown", e => {
    switch (e.key){
        case "Enter":
            document.querySelector("button#exc-cmd").click()
            break
        case "ArrowUp":
            e.target.value = sessionStorage.getItem("acp-cmd-history")
            break
        default:
            break
    }
})