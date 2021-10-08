class QuickButton{
    constructor(elem=null) {
        this.elem = elem
        this.button = document.createElement("button")
        this.button.classList.add("material-icons", "ripple", "mad-ripple")
    }
    title(title){
        this.button.title = title
        return this
    }
    class(...classes){
        this.button.classList.add(...classes)
        return this
    }
    attr(attr){
        for(let atr in attr){
            this.button.setAttribute(atr, attr[atr])
        }
        return this
    }
    icon(icon){
        this.button.innerHTML = icon
        return this
    }
    onClick(callback){
        this.button.addEventListener("click", e => {
            callback(this.button, e)
        })
        return this
    }
    spawn(elem=this.elem){
        elem.appendChild(this.button)
        return this
    }
    return(){
        return this.button
    }
    html(){
        return this.button.outerHTML
    }
}

class ContextButton{
    constructor(icon, text) {
        this.data = {icon, text, events: {}}
    }
    OnClick(callback){
        this.data.events.click = e => {
            callback(this, e)
        }
        return this
    }
    Classes(classes){
        this.data.classes = classes
        this.classList = classes.split(" ")
        this.classList.contains = key => {
            return this.classList.includes(key)
        }
        return this
    }
    Mode(mode){
        this.mode = mode
        return this
    }
    getAttribute(key){
        return this[key]
    }
    get(){
        return this.data
    }
}

function show_help(){
    let modal = new Modal("#modal-wrapper", {
        title: "Cloud Help & Info",
        centered: true,
        scrollable: true
    }, "max")
    modal.wrapper_body.style.height = "80vh"
    modal.Custom(`
        <div style="text-align: center; margin-top: 30vh">
            <div class="spinner-border"></div>
        </div>
    `)
    modal.show()
    fetch(`/cloud-help`).then(resp => {
        if(!resp.ok){
            modal.clear()
            modal.Custom(`<span class="text-danger">${resp.status}: ${resp.statusText}</span>`)
            return
        }
        resp.text().then(html => {
            modal.clear()
            modal.Custom(html)
        })
    }).catch(err => {
        modal.clear()
        modal.Custom(`<span class="text-danger">${err.status}: ${err.statusText}</span>`)
    })
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