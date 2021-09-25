class QuickButton{
    constructor(elem=null) {
        this.elem = elem
        this.button = document.createElement("button")
        this.button.classList.add("material-icons", "ripple")
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
        this.button.addEventListener("click", callback)
        return this
    }
    spawn(elem=this.elem){
        elem.appendChild(this.button)
        return this
    }
    return(){
        return this.button
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