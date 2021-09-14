{
    document.querySelectorAll(".link-expander-card .link-expander").forEach(elem => {
        let span = document.createElement("span")
        span.classList.add("material-icons")
        span.innerHTML = "expand_more"

        elem.appendChild(span)
        if(elem.parentNode.parentNode.querySelector(".collapse").classList.contains("show")){
            elem.querySelector("span").classList.add("expanded")
        }
    })
    function toggle(e){
        e.target.parentElement.querySelector(".link-expander-card .link-expander span.material-icons").classList.toggle("expanded")
    }
    document.querySelectorAll(".link-expander-card .collapse").forEach(instance => {
        instance.addEventListener("show.bs.collapse", e => {
            toggle(e)
        })
        instance.addEventListener("hide.bs.collapse", e => {
            toggle(e)
        })
    })
}
{
    document.querySelectorAll("a").forEach(elem => {
        if (elem.target === "_blank") return
        if (elem.hasAttribute("onclick")) return
        if (elem.hasAttribute("data-toggle")) return
        if (elem.hasAttribute("data-bs-toggle")) return
        if (elem.href === (location.protocol + "//" + location.host + "/#")) return
        for(let entry of elem.classList){
            let exclude = ["card-link", "stretched-link", "btn", "list-group-item", "list-group-item-action", "dropdown-item", "nav-link"]
            if(exclude.includes(entry)) return
        }
        if(elem.href.includes(`#`)){
            elem.addEventListener("click", e => {
                e.preventDefault()
                let linked = document.getElementById(elem.href.split("#").pop())
                $("html, body").animate({ scrollTop: $($(elem).attr("href")).offset().top-90 }, 500, _ => {
                    linked.style.transition = "color .3s"
                    linked.classList.add("text-warning")
                    setTimeout(_ => {
                        linked.classList.remove("text-warning")
                    }, 500)
                })
            })
        }
    })
}