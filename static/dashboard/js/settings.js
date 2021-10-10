$(".module-holder").sortable().disableSelection()
const observeDOM = (function(){
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    return function( obj, callback ){
        if( !obj || obj.nodeType !== 1 ) return;
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
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function insertBefore(referenceNode, newNode){
    referenceNode.parentNode.insertBefore(newNode, referenceNode)
}


let module_holder = document.querySelector(".module-holder")
let modules = document.querySelectorAll(".module")

modules.forEach(elem => {
    elem.addEventListener("click", _ => {
        elem.classList.toggle("active")
        if(!elem.classList.contains("active")){
            insertAfter(modules[modules.length - 1], elem)
        }
        modules = document.querySelectorAll(".module")
    })
})
observeDOM(module_holder, e => {
    console.log(e)
})