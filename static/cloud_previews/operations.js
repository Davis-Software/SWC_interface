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
    let proc = new Modal(null, {
        static_backdrop: true,
        title: "Compressing folder",
        close_button: "Cancel",
        template: Modal.slim_modal_body,
        centered: true
    })
    let pr_bar = proc.Custom(`
        <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated w-100">Processing files</div>
        </div>
    `).querySelector(".progress-bar")
    let dwn_btn = proc.Button("zip-dwn", "Download", "btn-success", {}, true)
    fetch(`${location.pathname}/${name}?download`).then(resp => {
        pr_bar.classList.remove("progress-bar-striped")
        pr_bar.innerText = "Compression complete - Preparing file download..."
        if(resp.ok){
            pr_bar.classList.add("bg-success")
            resp.blob().then(blob => {
                dwn_btn.disabled = false
                pr_bar.innerText = "Compression complete - You may download the zip file now"
                dwn_btn.addEventListener("click", _ => {
                    download_blob(blob, `${name}.zip`, blob.type)
                    pr_bar.innerText = "Downloading..."
                    pr_bar.classList.add("progress-bar-striped")
                    dwn_btn.innerHTML = "<div class='spinner-border spinner-border-sm'></div>"
                    dwn_btn.disabled = true
                    setTimeout(_ => {proc.hide(); pr_bar.innerText = "Download complete"}, 2000)
                })
            })
        }else{
            pr_bar.classList.add("bg-danger")
            pr_bar.innerText = resp.statusText
        }
    })
    dwn_btn.disabled = true
    proc.show()
}

function share_location(url, name){
    let modal = new Modal(null, {
        title: `Share '${name}'`,
        static_backdrop: true,
        centered: true
    }, "large")

    modal.FastText("All fileshares are only valid until the server restarts!", {
        class: "text-danger position-absolute"
    }, true).style.left = "20px"

    let div = modal.Custom(`
        Share Duration: <br><br> share for: &nbsp;&nbsp;
        <input id="h-inp" class="form-control d-inline w-auto" type="number" min="0" max="24" value="0"> hours and &nbsp;
        <input id="m-inp" class="form-control  d-inline w-auto" type="number" min="-1" max="60" value="5"> minutes
    `)

    let h_inp = div.querySelector("#h-inp")
    let m_inp = div.querySelector("#m-inp")

    m_inp.addEventListener("input", _ => {
        if(m_inp.value === "60"){
            m_inp.value = 0
            h_inp.value++
        }else if(m_inp.value < 5 && h_inp.value === "0"){
            m_inp.value = 5
        }else if(m_inp.value < 0){
            m_inp.value = 59
            h_inp.value--
        }
    })
    h_inp.addEventListener("input", _ => {
        if(h_inp.value === "0" && m_inp.value < 5){
            m_inp.value = 5
        }
    })

    let submit_btn = modal.Button("share-btn", "Share", "btn-warning", {}, true)
    submit_btn.addEventListener("click", _ => {
        submit_btn.disabled = true
        modal.clear()
        modal.Custom(`<div class="text-center"><div class="spinner-border"></div></div>`)

        let duration = parseInt(h_inp.value) * 60 + parseInt(m_inp.value)
        fetch(`${location.pathname}/${name}?share&duration=${duration}`).then(resp => {
            resp.text().then(file_id => {
                modal.clear()
                let file_path = `${location.host}/shared-cloud/${file_id}`
                modal.Custom(`
                    <div class="input-group">
                        <input class="form-control bg-dark text-white" type="text" value="${file_path}" disabled>
                        <button class="btn btn-info">Copy</button>
                    </div>
                `).querySelector(".btn.btn-info").addEventListener("click", e => {
                    navigator.clipboard.writeText(file_path).then(_ => {
                        e.target.textContent = "Copied!"
                    })
                })
            })
        })
    })

    modal.show()
}