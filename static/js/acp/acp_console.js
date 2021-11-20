function set_elem(elem){
    document.querySelector("#console").appendChild(elem)
    setTimeout(_ => {
        document.querySelector("#console-container").scrollTop = document.querySelector("#console-container").scrollHeight
    }, 10)
}
function make_pre(content, cs = ""){
    let pre = document.createElement("pre")
    pre.textContent = content
    pre.classList.add(cs)
    return pre
}


document.querySelector("button#exc-cmd").addEventListener("click", _ => {
    let cmd = document.querySelector("input[name=cmd]").value

    if(cmd === "clear"){
        document.querySelector("#console").innerHTML = ""
        sessionStorage.setItem("acp-cmd-history", cmd)
        document.querySelector("input[name=cmd]").value = ""
        return
    }

    let form = new FormData()
    let elem = document.createElement("li")

    form.append("exc_cmd", cmd)
    document.querySelector("input[name=cmd]").disabled = true
    elem.appendChild(
        make_pre(`shell$ >> ${cmd}`, "text-info")
    )

    fetch("", {
        method: "POST",
        body: form
    }).then(resp => {
        if (!resp.ok) {
            elem.appendChild(
                make_pre(`Error: ${resp.status} - ${resp.statusText}`, "text-danger")
            )
        } else {
            resp.json().then(json => {
                let state = json.data.exc_code
                let text = json.data.output
                if (text === "\f") {
                    document.querySelector("#console").innerHTML = ""
                } else {
                    let code_place = document.createElement("pre")
                    if(state !== 0){
                        code_place.classList.add("text-warning")
                        text += `\n >> Non-Zero Exit Code >> : ${state}`
                    }
                    code_place.textContent += text
                    elem.appendChild(code_place)
                }
            })
        }
    }).catch(err => {
        elem.appendChild(
            make_pre(err, "text-danger")
        )
    }).finally(_ => {
        set_elem(elem)
        document.querySelector("input[name=cmd]").disabled = false
        sessionStorage.setItem("acp-cmd-history", cmd)
        document.querySelector("input[name=cmd]").value = ""
        document.querySelector("input[name=cmd]").focus()
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