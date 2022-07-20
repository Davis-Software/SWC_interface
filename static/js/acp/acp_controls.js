function yesOrNo(title, text){
    return new Promise((resolve) => {
        let modal = new Modal(null, {
            title,
            close_button: "No",
            centered: true,
            static_backdrop: true,
            scrollable: false,
        })
        modal.Custom(`Are you sure you want to <span class="fw-bold text-warning">${text}</span>?`, "span")
        modal.Button("yes", "Yes", "btn btn-primary", {}, true).addEventListener("click", _ => {
            resolve(true)
            modal.destroy()
        })
        modal.on("hide", _ => {
            resolve(false)
        })
        modal.show()
    })
}

document.querySelector("#btn-power-off").addEventListener("click", () => {
    yesOrNo("Shutdown?", "shutdown now").then(res => {
        if(!res) return
        fetch("/acp/controls/power/shutdown").then(r => r.ok ? alert("Shutdown initiated") : alert("Failed to initiate shutdown"))
    })
})
document.querySelector("#btn-reboot").addEventListener("click", () => {
    yesOrNo("Reboot?", "reboot now").then(res => {
        if(!res) return
        fetch("/acp/controls/power/reboot").then(r => r.ok ? alert("Reboot initiated") : alert("Failed to initiate reboot"))
    })
})


const controlButtons = {
    "stop": "<button class='btn btn-danger' data-cmd='stop' id='btn-stop' disabled>Stop</button>",
    "restart": "<button class='btn btn-warning' data-cmd='restart' id='btn-restart' disabled>Restart</button>",
    "start": "<button class='btn btn-success' data-cmd='start' id='btn-start' disabled>Start</button>"
}

const controlBoxes = {}
const online = `<div class="status-online">Online</div>`
const offline = `<div class="status-offline">Offline</div>`

document.querySelectorAll(".control-box").forEach(box => {
    let buttonGroup = document.createElement("div")
    buttonGroup.classList.add("btn-group", "btn-group-lg", "d-flex")

    buttonGroup.innerHTML=
        Object.keys(controlButtons)
            .filter(k => box.getAttribute("data-commands").split(",").includes(k))
            .map(k => controlButtons[k]).join("")

    box.append(buttonGroup)
    controlBoxes[box.getAttribute("data-control")] = {
        box,
        buttonGroup,
        mode: box.getAttribute("data-mode"),
        commands: box.getAttribute("data-commands").split(",")
    }
})

Object.keys(controlBoxes).forEach(control => {
    let controlObj = controlBoxes[control]
    controlObj.buttonGroup.addEventListener("click", e => {
        let target = e.target
        if(target.tagName !== "BUTTON") return

        target.disabled = true
        let prevText = target.textContent
        target.innerHTML = `<div class="spinner-border spinner-border-sm"></div>`

        let cmd = target.getAttribute("data-cmd")
        fetch(`/acp/controls/${controlObj.mode}/${control}/${cmd}`).then(r => r.json()).then(data => {
            let status = data.success || data.exit_code === 0
            target.innerHTML = prevText

            if(status){
                setTimeout(() => updateControl(control), 2500)
            }else{
                alert(`Error while trying to execute command ${cmd} for the ${controlObj.mode.slice(0, -1)} ${control}\n\n${JSON.stringify(data)}`)
                target.disabled = false
            }
        })
    })
})

function updateControl(control){
    let controlObj = controlBoxes[control]
    let controlBox = controlBoxes[control].box

    controlBox.parentElement.querySelector(".status").innerHTML =
        `<div class="spinner-border spinner-border-sm"></div>`

    fetch(`/acp/controls/${controlObj.mode}/${control}/status`).then(r => r.json()).then(data => {
        let status = data.success || data.exit_code === 0
        controlBox.parentElement.querySelector(".status").innerHTML = status ? online : offline

        for(let cmd of ["stop", "restart"]){
            if(!controlObj.commands.includes(cmd)) continue
            controlObj.buttonGroup.querySelector(`[data-cmd="${cmd}"]`).disabled = !status
        }
        for(let cmd of ["start"]){
            if(!controlObj.commands.includes(cmd)) continue
            controlObj.buttonGroup.querySelector(`[data-cmd="${cmd}"]`).disabled = status
        }
    })
}

function update(){
    Object.keys(controlBoxes).forEach(updateControl)
}
setInterval(() => {
    if(sessionStorage.getItem("last_acp_ctrls_tab") !== "#other") return
    update()
}, 20000)
update()