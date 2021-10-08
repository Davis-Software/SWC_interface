function createRipple($, e=document) {
    $(".ripple").addClass("mad-ripple")
    $(e).on("mousedown", ".ripple", function(e) {
        let $self = $(this)
        if($self.is(".btn-disabled")) {
            return
        }
        if($self.closest(".ripple")) {
            e.stopPropagation()
        }

        let initPos = $self.css("position"),
            offs = $self.offset(),
            x = e.pageX - offs.left,
            y = e.pageY - offs.top,
            dia = Math.min(this.offsetHeight, this.offsetWidth, 100),
            $ripple = $('<div/>', {class : "ripple-inner",appendTo : $self })

        if(!initPos || initPos==="static") {
            $self.css({position:"relative"})
        }

        $('<div/>', {
            class : "rippleWave",
            css : {
                background: $self.data("ripple"),
                width: dia,
                height: dia,
                left: x - (dia/2),
                top: y - (dia/2),
            },
            appendTo: $ripple,
            one: {
                animationend : function(){
                    $ripple.remove();
                }
            }
        })
    })
}

{
    document.querySelectorAll(".btn, .dropdown-item, .card-link").forEach(elem => {
        elem.classList.add("ripple", "mad-ripple")
    })
    createRipple($)
}
