const observeDOM = (function(){
    let MutationObserver = window.MutationObserver
    return function( obj, callback ){
        if( !obj || obj.nodeType !== 1 ) return
        if( MutationObserver ){
            let mutationObserver = new MutationObserver(callback)
            mutationObserver.observe( obj, { childList:true, subtree:true })
            return mutationObserver
        }
        else if( window.addEventListener ){
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)
        }
    }
})()

async function getSetting(key){
    return (await (await fetch(`?get&key=${key}`, {
        method: "GET",
    })).json()).data.value
}
function setSetting(key, value){
    fetch(`?set&key=${key}`, {
        method: "PATCH",
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            value
        })
    }).catch(async err => {
        console.log(err)
    })
}

// title image
{
    let img_holder = document.querySelector(".title-img-holder")
    let images = img_holder.querySelectorAll(".image-preview")

    function save_image(img){
        setSetting("dash_title_img", img)
    }

    images.forEach(elem => {
        elem.addEventListener("click", _ => {
            img_holder.querySelector(".image-preview.active")?.classList.remove("active")
            elem.classList.add("active")
            save_image(elem.querySelector("img").getAttribute("data-img-id"))
        })
    })
}

// modules
{
    let module_holder = document.querySelector(".module-holder")
    let modules = module_holder.querySelectorAll(".module")

    $(module_holder).sortable().disableSelection()

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    function insertBefore(referenceNode, newNode){
        referenceNode.parentNode.insertBefore(newNode, referenceNode)
    }

    function save_modules() {
        let mods = module_holder.querySelectorAll(".module")
        let active_modules = []
        mods.forEach(elem => {
            if (!elem.classList.contains("active") || elem.classList.contains("ui-sortable-placeholder")) return
            let module_config = {}
            let module_config_e = elem.querySelector(".module-config")
            if(module_config_e){
                for(let conf of module_config_e.children){
                    let config_obj = conf.lastElementChild
                    module_config[config_obj.id] = config_obj.value
                }
            }
            active_modules.push(
                `${elem.querySelector(".module-inner").getAttribute("data-mod-id")}::::${JSON.stringify(module_config)}`
            )
        })
        setSetting("dash_modules", active_modules.join("|"))
    }

    modules.forEach(elem => {
        elem.addEventListener("click", e => {
            if(e.target.classList.contains("ignore-click")){
                return
            }
            elem.classList.toggle("active")
            if (!elem.classList.contains("active")) {
                insertAfter(modules[modules.length - 1], elem)
            } else {
                save_modules()
            }
            modules = document.querySelectorAll(".module")
        })
        let config = elem.querySelector(".module-config")
        if(config){
            config.querySelectorAll("label").forEach(conf => {
                conf.lastElementChild.addEventListener("input", save_modules)
            })
        }
    })
    observeDOM(module_holder, save_modules)
}