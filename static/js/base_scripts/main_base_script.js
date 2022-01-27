function createRipple(elem) {
    if(elem.classList.contains("ripple-legacy")) return

    $(elem).addClass("mad-ripple")
    $(elem).on("mousedown", e => {
        let $self = $(elem)
        if($self.is(".disabled")) {
            return
        }

        let offs = $self.offset()
        let x = e.pageX - offs.left
        let y = e.pageY - offs.top
        let dia = Math.min(elem.offsetHeight, elem.offsetWidth, 100)
        let $ripple = $('<div/>', { class : "ripple-inner", appendTo : $self })

        $('<div/>', {
            class : "rippleWave",
            css : {
                background: $self.data("ripple"),
                width: dia,
                height: dia,
                left: x - (dia/2),
                top: y - (dia/2)
            },
            appendTo: $ripple,
            one: {
                animationend : () => {
                    $ripple.remove()
                }
            }
        })
    })
}

{
    document.querySelectorAll(".btn, .dropdown-item, .card-header, .ripple, .mad-ripple").forEach(elem => {
        elem.classList.add("ripple")
        console.log(elem)
        createRipple(elem)
    })
    document.addEventListener("click", _ => {
        document.querySelectorAll(".btn:not(.ripple), .dropdown-item:not(.ripple), .card-header:not(.ripple)").forEach(elem => {
            elem.classList.add("ripple")
            createRipple(elem)
        })
    })
}
