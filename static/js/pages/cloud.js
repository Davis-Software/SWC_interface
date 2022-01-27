let first_load = true
let mobile = window.outerWidth < 1000

let sidebar = document.querySelector(".cloud-sidebar")
let cloud_main = document.querySelector(".cloud-main")
let path_view = document.querySelector(".path-view")
let load_progress = path_view.querySelector(".progress .progress-bar")
let path_view_list = document.querySelector(".path-view")
let cloud_opt_btn = document.querySelector(".path-options")
let cloud_help_btn = document.querySelector(".path-help")
let cloud_options = document.querySelector("div.path-options")
let cloud_opt_collapse = new bootstrap.Collapse(cloud_options)
let cloud_refresh = document.querySelector(".path-refresh")

let cloud_file_template = document.querySelector("#template-cloud-desktop")
let cloud_file_mobile_template = document.querySelector("#template-cloud-mobile")

let cloud_list = document.querySelector(".cloud-files tbody")
let preview_frame = document.querySelector("iframe")


async function apply_path_view(){
    let path = location.pathname.split("/").slice(2)
    path_view_list.querySelector("li a").addEventListener("click", e => {
        e.preventDefault()
        navigate_home()
    })
    for(let id in path){
        let step = path[id]
        let elem = document.createElement("li")
        elem.classList.add("path-part")
        createRipple(elem)
        elem.innerHTML = `
            <a><span>${step.replaceAll("%20", " ")}${Number(id)+1 !== path.length ? " >" : ""}</span></a>
        `
        let link = elem.querySelector("a")
        link.href = location.pathname.replace(path.join("/"), path.slice(0, Number(id) + 1).join("/"))
        link.addEventListener("click", e => {
            e.preventDefault()
            navigate_path(
                link.href,
                false
            )
        })
        path_view_list.appendChild(elem)
    }
}

function load_files(filter){
    path_view.classList.add("load")
    load_progress.style.width = "10%"

    function generate_file_list(files){
        let cloud_clipboard
        function update_clipboard(){
            cloud_clipboard = sessionStorage.getItem("cloud_file_clipboard") ? JSON.parse(sessionStorage.getItem("cloud_file_clipboard")) : null
        }
        update_clipboard()

        cloud_main.classList.remove("file-loaded")
        sidebar.classList.remove("preview-mode")
        cloud_opt_btn.hidden = false
        preview_frame.contentDocument.documentElement.innerHTML = ""

        if(first_load){
            {
                let context_menu = new ContextMenu([
                    {
                        icon: "add_circle",
                        text: "New",
                        classes: "swc-btn text-info position-relative",
                        sub: [
                            new ContextButton("note_add", "New File").OnClick(new_file).Classes("swc-btn text-info").get(),
                            new ContextButton("create_new_folder", "New Folder").OnClick(new_folder).Classes("swc-btn text-info").get(),
                            new ContextButton("cloud_upload", "Upload").OnClick(upload).Classes("swc-btn text-info").get(),
                        ]
                    },
                    new ContextButton("share", "Share").OnClick().Classes("swc-btn text-info single").Mode("share").get(),
                    {type: "divider"},
                    new ContextButton("content_paste", "Paste").OnClick(file_operations).Classes("swc-btn blue single").Mode("paste").get()
                ])
                document.querySelector(".table-scroller").addEventListener("contextmenu", e => {
                    e.stopPropagation()
                    if(e.target !== document.querySelector(".table-scroller")) {
                        context_menu.hide()
                        return
                    }
                    context_menu.display(e)
                })
            }
            first_load = false
        }
        let context_menu = new ContextMenu([
            {
                icon: "add_circle",
                text: "New",
                classes: "swc-btn text-info position-relative",
                sub: [
                    new ContextButton("note_add", "New File").OnClick(new_file).Classes("text-info").get(),
                    new ContextButton("create_new_folder", "New Folder").OnClick(new_folder).Classes("text-info").get(),
                    new ContextButton("cloud_upload", "Upload").OnClick(upload).Classes("text-info").get(),
                ]
            },
            {type: "divider"},
            new ContextButton("content_cut", "Cut").OnClick(file_operations).Classes("swc-btn blue").Mode("cut").get(),
            new ContextButton("content_copy", "Copy").OnClick(file_operations).Classes("swc-btn blue").Mode("copy").get(),
            new ContextButton("content_paste", "Paste").OnClick(file_operations).Classes("swc-btn blue").Mode("paste").get(),
            {type: "divider"},
            new ContextButton("edit", "Rename").OnClick(file_operations).Classes("swc-btn yellow").Mode("rename").get(),
            new ContextButton("delete", "Move to Trash").OnClick(file_operations).Classes("switchable swc-btn orange").Mode("trash").get(),
            new ContextButton("delete_forever", "Delete").OnClick(file_operations).Classes("switchable swc-btn red").Display(false).Mode("delete").get()
        ])
        function showDelete(bool){
            document.querySelectorAll(".cm_container.display li.switchable:nth-last-child(2)").forEach(e => {
                e.hidden = bool
            })
            document.querySelectorAll(".cm_container.display li.switchable:last-child").forEach(e => {
                e.hidden = !bool
            })
        }
        document.addEventListener("keydown", e => {
            if(e.key !== "Control"){return}
            showDelete(true)
        })
        document.addEventListener("keyup", e => {
            if(e.key !== "Control" || location.href.includes("trash")){return}
            showDelete(false)
        })

        if(!files){
            show_error("Unknown Error (more info in console)")
            console.error("Failed to execute 'generate_file_list' since 'files' is null")
            return
        }
        if(files.length === 0){
            show_info("Empty Directory")
        }

        function file_operations(btn, _){
            let items = btn.classList.contains("swc-btn") ? Array.from(cloud_list.querySelectorAll("tr.selected")) : [btn.parentElement.parentElement]
            let latest = btn.classList.contains("swc-btn") ? cloud_list.querySelector("tr.selected-most-recently") : items[0]
            let mode = btn.getAttribute("mode")
            let files_list = items.map(item => {
                return {
                    path: item.querySelector(".cloud-item-name a").getAttribute("href"),
                    name: item.querySelector(".cloud-item-name a").getAttribute("name"),
                    directory: item.querySelector(".cloud-item-name a").getAttribute("data-directory") === "true"
                }
            })
            let latest_file
            if(!btn.classList.contains("single")) {
                latest_file = {
                    path: latest.querySelector(".cloud-item-name a").getAttribute("href"),
                    name: latest.querySelector(".cloud-item-name a").getAttribute("name"),
                    directory: latest.querySelector(".cloud-item-name a").getAttribute("data-directory") === "true"
                }
            }

            function info_modal(message, callback){
                let modal = new Modal(null, {close_button: "OK", title: "Cloud Info", template: Modal.slim_modal_body})
                modal.FastText(message)
                modal.show()
                if(callback) {
                    modal.on("hide", callback)
                }
            }
            function process_modal(multiple){
                let modal = new Modal("#modal-wrapper", {static_backdrop: true, title: "File Operation", centered: true, template: Modal.slim_modal_body})
                modal.Custom(`<div class='progress'><div class='progress-bar progress-bar-animated progress-bar-striped w-100'>Processing ${multiple ? "files" : "file"}</div></div>`)
                modal.show()
                return modal
            }

            update_clipboard()
            switch (mode){
                case "cut":
                    sessionStorage.setItem("cloud_file_clipboard", JSON.stringify({mode, files: files_list}))
                    info_modal(`Cut ${files_list.length} ${files_list.length > 1 ? "elements" : "element"} to the clipboard.`)
                    clear_content().then(_ => {generate_file_list(files)})
                    break
                case "copy":
                    sessionStorage.setItem("cloud_file_clipboard", JSON.stringify({mode, files: files_list}))
                    info_modal(`Copied ${files_list.length} ${files_list.length > 1 ? "elements" : "element"} to the clipboard.`)
                    break
                case "paste":
                    if(cloud_clipboard){
                        if(cloud_clipboard.mode === "cut"){
                            sessionStorage.setItem("cloud_file_clipboard", null)
                        }
                        let proc = process_modal(cloud_clipboard.files.length > 1)
                        let form = new FormData()
                        form.append("mode", mode)
                        form.append("data", JSON.stringify(cloud_clipboard))
                        fetch("?post-ops", {
                            method: "POST",
                            body: form
                        }).then(resp => {
                            setTimeout(_ => {
                                proc.hide()
                                if(resp.ok){
                                    info_modal(`Pasted ${cloud_clipboard.files.length} ${cloud_clipboard.files.length > 1 ? "elements" : "element"} from the clipboard.`, update_info)
                                }else{
                                    show_error(resp.statusText)
                                }
                            }, 500)
                        })
                    }else{
                        info_modal("Nothing to paste.")
                    }
                    break
                case "rename":
                    let modal1 = new Modal(null, {
                        title: "Rename",
                        static_backdrop: true,
                        close_button: "Cancel"
                    })
                    modal1.wrapper_body.setAttribute("style", "display:flex;")
                    let file_name = modal1.Input("rename-file-name", "text", latest_file.directory ? "" : "w-50", {placeholder: latest_file.directory ? "Folder" : "File"}, false)
                    let file_extension = {}
                    if(!latest_file.directory){
                        modal1.FastText(".", {
                            style: "font-size:25px;padding:0 5px;"
                        })
                        file_extension = modal1.Input("rename-file-ext", "text", "w-25", {placeholder: "txt"}, false)
                    }

                    file_name.value = latest_file.directory ? latest_file.name : latest_file.name.split(".").slice(0, -1).join(".")
                    file_extension.value = latest_file.name.split(".").pop()

                    let btn = modal1.Button(
                        "rename-submit-btn",
                        "Rename",
                        "btn-warning",
                        {},
                        true
                    )
                    function check(){
                        btn.disabled = file_name.value === "" || (latest_file.directory || file_extension.value.replaceAll(" ", "") === "" ? file_name.value : `${file_name.value}.${file_extension.value.replaceAll(" ", "")}`) === latest_file.name
                    }
                    check()
                    file_name.addEventListener("input", check)
                    if(!latest_file.directory) {
                        file_extension.addEventListener("input", check)
                    }
                    btn.addEventListener("click", _ => {
                        let new_name = latest_file.directory || file_extension.value.replaceAll(" ", "") === "" ? file_name.value : `${file_name.value}.${file_extension.value.replaceAll(" ", "")}`
                        let form = new FormData()
                        form.append("mode", mode)
                        form.append("data", JSON.stringify({
                            file: latest_file.name,
                            new_name
                        }))
                        modal1.hide()
                        fetch("?post-ops", {
                            method: "POST",
                            body: form
                        }).then(resp => {
                            if(resp.ok){
                                update_info()
                            }else{
                                show_error(resp.statusText)
                            }
                        })
                    })
                    modal1.show()
                    break
                case "trash":
                    let modal2 = new Modal(null, {title: "Move to trash?", close_button: "Cancel", static_backdrop: true})
                    modal2.FastText(`Are you sure you want to move ${files_list.length} ${files_list.length > 1 ? "elements" : "element"} to trash?`)
                    modal2.Button("yes-btn", "Move to trash", "btn-warning", {}, true).addEventListener("click", _ => {
                        let form = new FormData()
                        form.append("mode", mode)
                        form.append("data", JSON.stringify({
                            files: files_list
                        }))
                        modal2.hide()
                        fetch("?post-ops", {
                            method: "POST",
                            body: form
                        }).then(resp => {
                            if(resp.ok){
                                update_info()
                            }else{
                                show_error(resp.statusText)
                            }
                        })
                    })
                    modal2.show()
                    break
                case "delete":
                    let modal3 = new Modal(null, {title: "Delete file?", close_button: "Cancel", static_backdrop: true})
                    modal3.FastText(`Are you sure you want to delete ${files_list.length} ${files_list.length > 1 ? "elements" : "element"}?`)
                    modal3.Button("yes-btn", "Delete", "btn-danger", {}, true).addEventListener("click", _ => {
                        let form = new FormData()
                        form.append("mode", mode)
                        form.append("data", JSON.stringify({
                            files: files_list
                        }))
                        modal3.hide()
                        fetch("?post-ops", {
                            method: "POST",
                            body: form
                        }).then(resp => {
                            if(resp.ok){
                                update_info()
                            }else{
                                show_error(resp.statusText)
                            }
                        })
                    })
                    modal3.show()
                    break
                default:
                    info_modal(`Unknown operation mode "${mode}".`)
                    break
            }
        }
        function apply_navigation(elem, file){
            let nav = elem.querySelector(".cloud-item-name")
            let file_name = file.directory ? file.name + "/" : file.name.includes("/") ? file.name.split("/").pop() + `    (${file.name})` : file.name
            let cut_files = cloud_clipboard && cloud_clipboard.mode === "cut" ? cloud_clipboard.files.map(item => {return item.path}) : []

            elem.addEventListener("click", e => {
                cloud_list.querySelectorAll("tr").forEach(elem_all => {
                    elem_all.classList.remove("selected-most-recently")
                })
                if(!e.ctrlKey || (e.target.parentNode !== elem)) {
                    cloud_list.querySelectorAll("tr").forEach(elem_all => {
                        elem_all.classList.remove("selected")
                    })
                }
                elem.classList.toggle("selected")
                elem.classList.add("selected-most-recently")
            })
            elem.addEventListener("contextmenu", e => {
                e.preventDefault()
                if(e.target.parentNode !== elem){return}
                cloud_list.querySelectorAll("tr").forEach(elem_all => {
                    elem_all.classList.remove("selected-most-recently")
                })
                if(((!e.ctrlKey && !mobile) || (e.target.parentNode !== elem)) && !Array.from(cloud_list.querySelectorAll("tr.selected")).includes(e.target.parentNode)) {
                    cloud_list.querySelectorAll("tr").forEach(elem_all => {
                        elem_all.classList.remove("selected")
                    })
                }
                elem.classList.add("selected")
                elem.classList.add("selected-most-recently")
                context_menu.display(e)
                showDelete(location.href.includes("trash"))
            })


            let link = document.createElement("a")
            link.innerHTML = `
                <i class="material-icons text-white">${file.icon}</i>
                ${file_name}
            `
            link.href = `${location.pathname}/${file.name}`
            link.setAttribute("name", file.name)
            link.setAttribute("data-directory", file.directory)
            link.addEventListener("click", e => {
                e.preventDefault()
                navigate_path(link.href, false)
            })
            if(cut_files.includes(link.getAttribute("href"))){
                link.classList.add("text-secondary")
            }
            nav.appendChild(link)
        }
        function populate_options(elem, file){
            elem = elem.querySelector(".cloud-item-options")
            if(!elem){return}
            if(file.directory){
                new QuickButton(elem)
                    .class("text-info")
                    .title("Download Folder as ZIP")
                    .icon("archive")
                    .onClick(_ => {
                        download_folder(file.name)
                    })
                    .spawn()
            }else{
                new QuickButton(elem)
                    .class("text-info")
                    .title("Download File")
                    .icon("file_download")
                    .onClick(_ => {
                        download_file(`${location.pathname}/${file.name}`, file.name)
                    })
                    .spawn()
            }
            new QuickButton(elem)
                .class("blue")
                .title("Share link")
                .icon("share")
                .onClick(_ => {})
                .spawn()
        }
        function populate_operations(elem, file){
            elem = elem.querySelector(".cloud-item-ops")
            if(!elem){return}
            let file_or_folder = file.directory ? "Folder" : "File"
            new QuickButton(elem)
                .class("blue")
                .title(`Cut ${file_or_folder}`)
                .icon("content_cut")
                .attr({mode: "cut"})
                .onClick(file_operations)
                .spawn()
            new QuickButton(elem)
                .class("blue")
                .title(`Copy ${file_or_folder}`)
                .icon("content_copy")
                .attr({mode: "copy"})
                .onClick(file_operations)
                .spawn()
            new QuickButton(elem)
                .class("yellow")
                .title(`Rename ${file_or_folder}`)
                .icon("edit")
                .attr({mode: "rename"})
                .onClick(file_operations)
                .spawn()
            if(location.href.includes("/trash")){
                new QuickButton(elem)
                    .class("red")
                    .title(`Delete ${file_or_folder}`)
                    .icon("delete_forever")
                    .attr({mode: "delete"})
                    .onClick(file_operations)
                    .spawn()
                    .return()
            }else{
                new QuickButton(elem)
                    .class("orange")
                    .title(`Move ${file_or_folder} to trash`)
                    .icon("delete")
                    .attr({mode: "trash"})
                    .onClick(file_operations)
                    .spawn()
                    .return()
            }

        }

        function create_apply_and_populate(file){
            let elem = document.createElement("tr")
            elem.innerHTML = (mobile ? cloud_file_mobile_template : cloud_file_template).innerHTML
            createRipple(elem)
            apply_navigation(elem, file)
            populate_options(elem, file)
            elem.querySelector(".cloud-item-type").innerText = file.type
            elem.querySelector(".cloud-item-size").innerText = file.size
            populate_operations(elem, file)
            cloud_list.appendChild(elem)
        }
        for(let folder of files){
            if(!folder.directory){continue}
            if(folder.name === "trash"){continue}
            create_apply_and_populate(folder)
        }
        for(let file of files){
            if(file.directory){continue}
            create_apply_and_populate(file)
        }
        document.addEventListener("keydown", e => {
            if(e.key === "Escape"){
                cloud_list.querySelectorAll("tr").forEach(elem_all => {
                    elem_all.classList.remove("selected")
                })
            }
        })
    }
    function start_file_preview(){
        cloud_main.classList.add("file-loaded")
        sidebar.classList.add("preview-mode")
        preview_frame.src = location.href + "?preview"
        cloud_opt_collapse.hide()
        cloud_opt_btn.hidden = true
    }

    let xhr = new XMLHttpRequest()
    xhr.open('GET', `?data${filter ? "&filter="+filter : ""}`, true)

    xhr.addEventListener("loadstart", _ => {
        load_progress.style.width = "30%"
    })
    xhr.addEventListener("progress", e => {
        load_progress.style.width = `${50+(e.loaded/e.total*50)}%`
    })
    xhr.addEventListener("loadend", _ => {
        load_progress.classList.add("progress-bar-striped")
        load_progress.style.width = "100%"
        setTimeout(_ => {
            path_view.classList.remove("load")
            load_progress.style.width = "0%"
            load_progress.classList.remove("progress-bar-striped")
        }, 150)
    })
    xhr.addEventListener("load", e => {
        let res = e.target
        if(res.status === 200){
            let response = JSON.parse(res.response)
            if(response.data.preview_mode){
                start_file_preview()
            }else {
                generate_file_list(response.data)
            }
        }else if(res.status === 401){
            show_error("You do not have permission to access the cloud!")
        }else{
            show_error(`Error ${res.status}: ${res.statusText}`)
        }
    })
    xhr.addEventListener("error", e => {
        if(e.target.status === 0){
            show_error("Error: Communication with server failed")
        }else {
            show_error(`Error ${e.target.status}: ${e.target.statusText}`)
        }
    })
    xhr.addEventListener("timeout", _ => {
        show_error(`Error: Connection timeout`)
    })

    xhr.send()
}
preview_frame.addEventListener("loadstart", _ => {
    path_view.classList.add("load")
    load_progress.style.width = "0%"
})
preview_frame.addEventListener("progress", e => {
    load_progress.style.width = `${e.loaded/e.total*100}%`
})
preview_frame.addEventListener("load", _ => {
    load_progress.classList.add("progress-bar-striped")
    load_progress.style.width = "100%"
    setTimeout(_ => {
        path_view.classList.remove("load")
        load_progress.style.width = "0%"
        load_progress.classList.remove("progress-bar-striped")
    }, 200)
})

async function clear_content(){
    path_view_list.querySelectorAll("li.path-part").forEach(elem => {
        path_view_list.removeChild(elem)
    })
    cloud_list.innerHTML = ""
}



apply_path_view().then()
load_files()


function update_info(filter){
    clear_content().then()
    apply_path_view().then()
    load_files(typeof filter === "string" ? filter : null)
}

let clientX
let clientY
document.addEventListener("mousemove", e => {
    e.stopPropagation()
    clientX = e.clientX
    clientY = e.clientY
})
document.addEventListener("keydown", e => {
    if(e.key === "a" && e.ctrlKey){
        if(!cloud_list.contains(document.elementFromPoint(clientX, clientY))) return
        e.preventDefault()
        cloud_list.querySelectorAll("tr").forEach(elem => {
            elem.classList.add("selected")
        })
    }
})

cloud_help_btn.addEventListener("click", _ => {
    show_help()
})
cloud_opt_btn.addEventListener("click", _ => {
    cloud_opt_collapse.toggle()
}, {capture: false})
document.addEventListener("keydown", e => {
    if(e.key === "f" && e.ctrlKey){
        e.preventDefault()
        cloud_opt_collapse.show()
        cloud_options.querySelector("input").focus()
    }
})
cloud_options.querySelector("input").addEventListener("input", e => {
    if(e.target.value.length < 4 && e.target.value !== "") return
    update_info(e.target.value)
})
cloud_options.querySelector("input").addEventListener("keydown", e => {
    if(e.key === "Escape"){
        cloud_opt_collapse.hide()
    }
})
cloud_options.addEventListener("show.bs.collapse", _ => {
    cloud_opt_btn.firstElementChild.innerHTML = "arrow_drop_down"
    cloud_opt_btn.classList.add("reverse")
})
cloud_options.addEventListener("hide.bs.collapse", _ => {
    cloud_opt_btn.firstElementChild.innerHTML = "search"
    cloud_opt_btn.classList.remove("reverse")
    if(cloud_options.querySelector("input").value !== ""){
        cloud_options.querySelector("input").value = ""
        if(!sidebar.classList.contains("preview-mode")){
            update_info()
        }
    }
})
setTimeout(_ => {
    cloud_opt_collapse.hide()
    cloud_options.hidden = false
}, 500)
cloud_refresh.addEventListener("click", _ => {
    update_info()
    cloud_refresh.classList.add("spin")
    setTimeout(_ => {
        cloud_refresh.classList.remove("spin")
    }, 1010)
}, {capture: false})


function navigate_back(){
    if(location.pathname.split("/").length === 2){return}
    history.replaceState({
        html: document.body.innerHTML,
        pageTitle: document.title
    }, "cloud-navigation", location.pathname.split("/").slice(0, -1).join("/"))
    update_info()
}
function navigate_home(){
    if(location.pathname.split("/").length === 2){return}
    history.pushState({
        html: document.body.innerHTML,
        pageTitle: document.title
    }, "cloud-navigation", location.pathname.split("/").slice(0, 2).join("/"))
    update_info()
}
function navigate_path(path, cloud_relative=true){
    let requested_location = cloud_relative ? location.pathname.split("/").slice(0, 2).join("/") + `/${path}` : path
    if(requested_location === location.pathname){return}
    history.pushState({
        html: document.body.innerHTML,
        pageTitle: document.title
    }, "cloud-navigation", requested_location)
    update_info()
}
window.addEventListener("popstate", (e, _) => {
    e.preventDefault()
    update_info()
})


{
    let cloud_table = document.querySelector(".cloud-files")
    document.querySelector(".cloud-sidebar-toggle").addEventListener("click", _ => {
        cloud_table.classList.toggle("invis")
        sidebar.classList.toggle("closed")
    })
    function resized() {
        mobile = window.outerWidth < 1300
        if (window.outerWidth < 1300) {
            sidebar.classList.add("should-close")
            sidebar.classList.add("closed")
            cloud_table.classList.add("mobile-view")
        } else {
            sidebar.classList.remove("should-close")
            sidebar.classList.remove("closed")
            cloud_table.classList.remove("mobile-view")
        }
    }

    window.addEventListener("resize", resized)
    resized()
}