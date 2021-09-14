{
    const top_link = document.querySelector(".link-top")
    $(top_link).fadeOut(0)

    document.addEventListener("scroll", _ => {
        if(document.documentElement.scrollTop > 800) $(top_link).fadeIn(200)
        else $(top_link).fadeOut(200)
    })
    top_link.querySelector("button").addEventListener("click", _ => {
        $("html,body").animate({scrollTop: 0}, 500)
    })
}