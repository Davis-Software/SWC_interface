let quick_loading_mode = true

let cloud_main = document.querySelector(".cloud-main")
let path_view = document.querySelector(".path-view")
let load_progress = path_view.querySelector(".progress .progress-bar")
let path_view_list = document.querySelector(".path-view")
let cloud_refresh = document.querySelector(".path-refresh")

let cloud_file_template = document.querySelector("#template-cloud-file")
// let cloud_file_trash_template = document.querySelector("#template-cloud-file-trash")
let cloud_folder_template = document.querySelector("#template-cloud-folder")
// let cloud_folder_trash_template = document.querySelector("#template-cloud-folder-trash")

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
function show_error(error){
    cloud_list.innerHTML = `
    <tr>
        <td><span class="text-danger">${error}</span></td>
        <td><span class="text-danger">-</span></td>
        <td><span class="text-danger">-</span></td>
        <td><span class="text-danger">-</span></td>
        <td><span class="text-danger">-</span></td>
    </tr>
    `
}
function show_info(info){
    cloud_list.innerHTML = `
    <tr>
        <td>${info}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>
    `
}
function load_files(){
    path_view.classList.add("load")
    load_progress.style.width = "10%"

    function apply_functionality(elem, file){
        let link = elem.querySelector("td:first-child a")

        link.href = `${location.pathname}/${file.name}`
        if(quick_loading_mode){
            link.addEventListener("click", e => {
                e.preventDefault()
                history.pushState({
                    html: document.body.innerHTML,
                    pageTitle: document.title
                }, "cloud-navigation", link.href)
                update_info()
            })
        }
    }
    function generate_file_list(files){
        cloud_main.classList.remove("file-loaded")
        preview_frame.contentDocument.documentElement.innerHTML = ""

        if(!files){
            show_error("Unknown Error (more info in console)")
            console.error("Failed to execute 'generate_file_list' since 'files' is null")
            return
        }
        if(files.length === 0){
            show_info("Empty Directory")
        }
        for(let folder of files){
            if(!folder.directory){continue}
            if(folder.name === "trash"){continue}

            let elem = document.createElement("tr")
            elem.innerHTML = cloud_folder_template.innerHTML
                .replace("var_folder_name", folder.name)
                .replace("var_folder_size", folder.size)
            apply_functionality(elem, folder)

            cloud_list.appendChild(elem)
        }
        for(let file of files){
            if(file.directory){continue}

            let elem = document.createElement("tr")
            elem.innerHTML = cloud_file_template.innerHTML
                .replace("var_file_name", file.name)
                .replace("var_file_size", file.size)
                .replace("var_file_type", file.type)
            apply_functionality(elem, file)

            cloud_list.appendChild(elem)
        }
    }
    function start_file_preview(){
        cloud_main.classList.add("file-loaded")
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
preview_frame.contentDocument.documentElement.addEventListener("loadstart", _ => {
    path_view.classList.add("load")
    load_progress.style.width = "0%"
})
preview_frame.contentDocument.documentElement.addEventListener("progress", e => {
    load_progress.style.width = `${e.loaded/e.total*100}%`
})
preview_frame.contentDocument.documentElement.addEventListener("load", _ => {
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