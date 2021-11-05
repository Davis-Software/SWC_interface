function set_pg_bar(val){
    let pg = document.querySelector(".progress")
    if(val === null){
        setTimeout(_ => {
            $(pg).animate({height: 0}, 200)
            pg.querySelector(".progress-bar").style.width = `0`
        }, 100)
    }else{
        if(pg.style.height === "0px"){
            $(pg).animate({height: 5}, 200)
        }
        pg.querySelector(".progress-bar").style.width = `${val * 100}%`
    }
}
window.addEventListener("load", _ => {
    set_pg_bar(null)
})


let select = document.querySelector("#selector")
let frame = document.querySelector("#module-view")

function load_module(module_id){
    if(module_id === null){
        set_pg_bar(1)
        frame.hidden = true
        select.hidden = false
        frame.querySelector(".holder").innerHTML = ""
        set_pg_bar(null)
        return
    }

    let src = `?get=${module_id}`

    let xhr = new XMLHttpRequest()
    xhr.open('GET', src, true)

    xhr.addEventListener("loadstart", _ => {
        set_pg_bar(0)
    })
    xhr.addEventListener("progress", e => {
        set_pg_bar(e.loaded / e.total)
    })
    xhr.addEventListener("loadend", _ => {
        set_pg_bar(null)
    })
    xhr.addEventListener("load", e => {
        let res = e.target
        if(res.status === 200){
            frame.querySelector(".holder").innerHTML = e.target.response
            select.hidden = true
            frame.hidden = false
        }else{
            console.log(`Error ${res.status}: ${res.statusText}`)
        }
    })
    xhr.addEventListener("error", e => {
        if(e.target.status === 0){
            console.log("Error: Communication with server failed")
        }else {
            console.log(`Error ${e.target.status}: ${e.target.statusText}`)
        }
    })
    xhr.addEventListener("timeout", _ => {
        console.log(`Error: Connection timeout`)
    })

    xhr.send()
}

frame.addEventListener("progress", e => {
    set_pg_bar(e.loaded / e.total)
})
frame.addEventListener("load", _ => {
    set_pg_bar(null)
})