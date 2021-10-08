let mobile = window.outerWidth < 1300

let sidebar = document.querySelector(".cloud-sidebar")
let cloud_main = document.querySelector(".cloud-main")
let path_view = document.querySelector(".path-view")
let load_progress = path_view.querySelector(".progress .progress-bar")
let path_view_list = document.querySelector(".path-view")
let cloud_opt_btn = document.querySelector(".path-options")
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
        elem.classList.add("path-part", "ripple", "mad-ripple")
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

function load_files(){
    path_view.classList.add("load")
    load_progress.style.width = "10%"

    function generate_file_list(files){
        cloud_main.classList.remove("file-loaded")
        sidebar.classList.remove("preview-mode")
        preview_frame.contentDocument.documentElement.innerHTML = ""
        let context_menu = new ContextMenu([
            {
                text: "<b>Download in a ZIP file</b>"
            },{
                "type": ContextMenu.DIVIDER
            },{
                text: "Download in a ZIP file"
            }
        ])

        if(!files){
            show_error("Unknown Error (more info in console)")
            console.error("Failed to execute 'generate_file_list' since 'files' is null")
            return
        }
        if(files.length === 0){
            show_info("Empty Directory")
        }

        function apply_navigation(elem, file){
            let nav = elem.querySelector(".cloud-item-name")
            let file_name = file.directory ? file.name + "/" : file.name

            elem.addEventListener("click", e => {
                if(!e.ctrlKey || (e.target.parentNode !== elem)) {
                    cloud_list.querySelectorAll("tr").forEach(elem_all => {
                        elem_all.classList.remove("selected")
                    })
                }
                elem.classList.toggle("selected")
            })
            elem.addEventListener("contextmenu", e => {
                e.preventDefault()
                if(e.target.parentNode !== elem){return}
                if(!elem.classList.contains("selected")){
                    elem.classList.add("selected")
                }
                context_menu.display(e)
            })


            let link = document.createElement("a")
            link.innerHTML = `
                <i class="material-icons text-white">${file.icon}</i>
                ${file_name}
            `
            link.href = `${location.pathname}/${file.name}`
            link.addEventListener("click", e => {
                e.preventDefault()
                navigate_path(link.href, false)
            })
            nav.appendChild(link)
        }
        function populate_options(elem, file){
            elem = elem.querySelector(".cloud-item-options")
            if(file.directory){
                new QuickButton(elem)
                    .class("text-info")
                    .title("Download Folder as ZIP")
                    .icon("archive")
                    .onClick(_ => {
                        console.log(`${location.pathname}/${file.name}`, file.name)
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
            let file_or_folder = file.directory ? "Folder" : "File"
            new QuickButton(elem)
                .class("blue")
                .title(`Cut ${file_or_folder}`)
                .icon("content_cut")
                .onClick()
                .spawn()
            new QuickButton(elem)
                .class("blue")
                .title(`Copy ${file_or_folder}`)
                .icon("content_copy")
                .onClick()
                .spawn()
            new QuickButton(elem)
                .class("green")
                .title(`Move ${file_or_folder}`)
                .icon("drive_file_move")
                .onClick()
                .spawn()
            new QuickButton(elem)
                .class("yellow")
                .title(`Rename ${file_or_folder}`)
                .icon("edit")
                .onClick()
                .spawn()

            let to_trash = new QuickButton(elem)
                .class("orange")
                .title(`Move ${file_or_folder} to trash`)
                .icon("delete")
                .onClick()
                .spawn()
                .return()
            let remove = new QuickButton(elem)
                .class("red")
                .attr({hidden: null})
                .title(`Delete ${file_or_folder}`)
                .icon("delete_forever")
                .onClick()
                .spawn()
                .return()
            {
                document.addEventListener("keydown", e => {
                    if(e.key !== "Control"){return}
                    to_trash.hidden = true
                    remove.hidden = false
                })
                document.addEventListener("keyup", e => {
                    if(e.key !== "Control"){return}
                    to_trash.hidden = false
                    remove.hidden = true
                })
            }
        }

        function create_apply_and_populate(file){
            let elem = document.createElement("tr")
            elem.innerHTML = (mobile ? cloud_file_mobile_template : cloud_file_template).innerHTML
            elem.classList.add("ripple", "mad-ripple")
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
    }

    let xhr = new XMLHttpRequest()
    xhr.open('GET', "?data", true)

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


function update_info(){
    clear_content().then()
    apply_path_view().then()
    load_files()
}


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