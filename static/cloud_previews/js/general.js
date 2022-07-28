(() => {
    const popoutMenu = document.querySelector(".popout-menu")

    popoutMenu.querySelector(".btn[data-cmd='cp-link']").addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => alert("Copied to clipboard!"))
    })
})()