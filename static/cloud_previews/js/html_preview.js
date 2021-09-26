let editor = ace.edit("editor")
let preview = document.querySelector(".html-container")
let info = document.querySelector("#file-info")
let editor_wrapper = document.querySelector("#editor")
let view_switcher = document.querySelector("#view-switcher")

function switch_task(mode){
    switch(mode){
        case 0:
            editor_wrapper.classList.add("hide")
            preview.classList.remove("hide")
            preview.style.width = "100%"
            break
        case 1:
            editor_wrapper.classList.remove("hide")
            preview.classList.remove("hide")
            editor_wrapper.style.width = "50%"
            preview.style.width = "50%"
            break
        case 2:
            editor_wrapper.classList.remove("hide")
            preview.classList.add("hide")
            editor_wrapper.style.width = "100%"
    }
    localStorage.setItem("html_preview_mode", mode)
}
view_switcher.querySelectorAll("span").forEach(elem => {
    elem.addEventListener("click", _ => {
        view_switcher.querySelectorAll("span").forEach(elem => {elem.classList.remove("active")})
        elem.classList.add("active")
        switch_task(Number(elem.getAttribute("data-mode")))
    })
})
view_switcher.querySelectorAll("span")[localStorage.getItem("html_preview_mode") || 0].click()

editor.insert("loading...")
preview.contentDocument.documentElement.innerText = "loading..."
fetch(location.href + "&raw=true").then(resp => {
    resp.json().then(data => {
        editor.setValue(data.data[0])
        editor.session.setMode(
            mode_list.getModeForPath(data.data[1]).mode
        )
        update_md(data.data[0]).then()
        editor.addEventListener("change", _ => {
            info.innerHTML = "* Unsaved Changes * || <a onclick='save(editor)' href='#'>Save</a>"
        })
        editor.commands.addCommand({
            name: "save",
            bindKey: {win: "Ctrl-s", mac: "Command-s"},
            exec: save
        })
        editor.clearSelection()
    })
}, _ => {
    editor.setValue("error loading content")
})

editor.setOption("cursorStyle", "smooth")
editor.setOption("behavioursEnabled", true)
editor.setOption("showPrintMargin", false)
editor.setOption("copyWithEmptySelection", true)
editor.setOption("enableBasicAutocompletion", true)
editor.setOption("enableLiveAutocompletion", true)

editor.renderer.setOption("animatedScroll", true)
editor.renderer.setOption("fadeFoldWidgets", true)
editor.renderer.setOption("theme", "ace/theme/tomorrow_night")

async function update_md(text){
    preview.innerText = "Updating..."
    if(!text){
        text = (await (await fetch(location.href + "&raw=true")).json()).data[0]
    }
    preview.contentDocument.documentElement.innerHTML = text
    preview.contentDocument.documentElement.querySelectorAll("*[href]").forEach(elem => {
        console.log(elem)
        elem.addEventListener("click", e => {
            e.preventDefault()
            alert("Links in html documents are disabled!")
        })
    })
}
async function save(editor){
    info.innerHTML = "Saving..."
    let data = editor.session.getValue()

    let form = new FormData()
    form.append("data", data)
    form.append("type", "TEXT")
    form.append("mode", "save")

    let response = await fetch("?post-set", {
        method: "POST",
        body: form
    })
    if(response.ok){
        info.innerHTML = "File Saved"
        await update_md()
    }else{
        info.innerHTML = "Error saving file: " + response.statusText
    }
}