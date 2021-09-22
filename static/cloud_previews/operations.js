function new_file(){
    let modal = new Modal(
        "#modal-wrapper",
        {
            title: "New File",
            centered: true
        }
    )

    let input = modal.Input(
        "name_input",
        "text",
        "form-control text-white"
    )
    modal.Button(
        "create-btn",
        "Create",
        "btn-success",
        {},
        true
    ).addEventListener("click", async e => {
        if(!input.value){
            return
        }

        input.disabled = true
        e.target.disabled = true

        let form = new FormData()
        form.append("type", "TEXT")
        form.append("name", input.value)

        let resp = await fetch("?post-create", {
            method: "POST",
            body: form
        })
        if(resp.ok){
            update_info() //update cloud info (function in cloud.js)
            modal.destroy()
        }else{
            modal.clear()
            modal.Text(
                "err-text",
                "span",
                `Error Uploading - Error ${resp.status}: ${resp.statusText}`
            )
        }
    })

    modal.show()
}

function new_folder(){
    let modal = new Modal(
        "#modal-wrapper",
        {
            title: "New Folder",
            centered: true
        }
    )

    let input = modal.Input(
        "name_input",
        "text",
        "form-control text-white"
    )
    modal.Button(
        "create-btn",
        "Create",
        "btn-success",
        {},
        true
    ).addEventListener("click", async e => {
        if(!input.value){
            return
        }

        input.disabled = true
        e.target.disabled = true

        let form = new FormData()
        form.append("type", "DIR")
        form.append("name", input.value)

        let resp = await fetch("?post-create", {
            method: "POST",
            body: form
        })
        if(resp.ok){
            update_info() //update cloud info (function in cloud.js)
            modal.destroy()
        }else{
            modal.clear()
            modal.Text(
                "err-text",
                "span",
                `Error Uploading - Error ${resp.status}: ${resp.statusText}`
            )
        }
    })

    modal.show()
}

function upload(){
    let modal = new Modal(
        "#modal-wrapper",
        {
            title: "Upload files",
            centered: true,
            static_backdrop: true
        }
    )

    let pr_bar = modal.Custom(`
        <div class="progress mb-4">
            <div class="progress-bar" style="width: 0"></div>
        </div>
    `).querySelector(".progress-bar")

    let input = modal.Input(
        "file-input",
        "file",
        "form-control btn btn-primary",
        {
            multiple: null
        }
    )

    modal.Button(
        "accept",
        "Upload",
        "btn btn-primary",
        {},
        true
    ).addEventListener("click", async e => {
        if(input.files.length > 0){
            let xhr = new XMLHttpRequest()
            let form = new FormData()

            for(let file of input.files){
                form.append(file.name, file)
            }

            xhr.open('POST', "?upload", true)

            xhr.addEventListener("loadstart", _ => {
                input.disabled = true
                e.target.disabled = true
            })
            xhr.upload.addEventListener("progress", e => {
                pr_bar.style.width = `${(e.loaded/e.total*100)}%`
                pr_bar.innerText = `${(e.loaded/e.total*100).toFixed(2)}%`
            })
            xhr.addEventListener("load", _ => {
                input.disabled = true
                e.target.disabled = true
                modal.destroy()
                update_info() //update cloud info (function in cloud.js)
            })

            function error(e){
                modal.clear()
                modal.Text(
                    "err-text",
                    "span",
                    `Error Uploading - Error ${e.status}: ${e.statusText}`
                )
            }
            xhr.addEventListener("error", error)
            xhr.addEventListener("timeout", error)

            modal.on("hide", _ => {
                xhr.abort()
            })

            xhr.send(form)
        }
    })

    modal.show()
}

function download_file(url, name){
    let elem = document.createElement("a")
    elem.href = url + "?download"
    elem.download = name
    elem.hidden = true
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
}

function download_folder(name){
    //wbd
}