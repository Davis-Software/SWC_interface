function continue_once(){
    setCookie("accepted-preview-warning", "once", 1)
    location.reload()
}
function continue_forever(){
    setCookie("accepted-preview-warning", "forever", 9999999)
    location.reload()
}