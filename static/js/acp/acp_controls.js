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
        fetch("/acp/controls/power/shutdown").then(() => alert("Shutdown initiated"))
    })
})
document.querySelector("#btn-reboot").addEventListener("click", () => {
    yesOrNo("Reboot?", "reboot now").then(res => {
        if(!res) return
        fetch("/acp/controls/power/reboot").then(() => alert("Reboot initiated"))
    })
})