let loader = document.querySelector(".spinner-border")
let img_elem = document.querySelector("#image")

function set_loader(val) {
    loader.hidden = !val
    document.querySelectorAll("button[data-action]").forEach(elem => {
        elem.disabled = val
    })
}
function set_image(data) {
    img_elem.src = data
}
img_elem.addEventListener("load", _ => {
    set_loader(false)
})

IJS.Image.load(img_elem.src).then(image => {
    document.querySelectorAll("button[data-action]").forEach(elem => {
        elem.addEventListener("click", async function () {
            set_loader(true)
            setTimeout(_ => {
                switch (elem.getAttribute("data-action")) {
                    case "f_h":
                        image = image.flipX()
                        break
                    case "f_v":
                        image = image.flipY()
                        break
                    case "r_r":
                        image = image.rotate(90)
                        break
                    case "r_l":
                        image = image.rotate(-90)
                        break
                    case "dwn":
                        image.toBlob("image/png", 1).then(blob => {
                            download_blob(
                                blob,
                                location.pathname.split("/").pop(),
                                blob.type
                            )
                        })
                        break
                    default:
                        return
                }
                set_image(image.toDataURL())
                set_loader(false)
            }, 100)
        })
    })
})

