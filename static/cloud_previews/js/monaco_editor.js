let editor = ace.edit("editor")
let info = document.querySelector("#file-info")

info.innerHTML = "loading..."
fetch(location.href + (location.href.includes("?") ? "&" : "?") + "raw=true").then(resp => {
    resp.json().then(data => {
        info.innerHTML = "File Saved"
        editor.setValue(data.data[0])
        editor.session.setMode(
            mode_list.getModeForPath(data.data[1]).mode
        )
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
// editor.renderer.setOption("scrollPastEnd", 1)
editor.renderer.setOption("theme", "ace/theme/tomorrow_night")

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
    }else{
        info.innerHTML = "Error saving file: " + response.statusText
    }
}