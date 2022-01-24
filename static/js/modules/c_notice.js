(function () {
    "use strict";
    let cookieAlert = document.querySelector(".cookiealert");
    let acceptCookies = document.querySelector(".acceptcookies");
    if (!cookieAlert) {
       return;
    }
    cookieAlert.offsetHeight;
    if (!getCookie("acceptCookies")) {
        cookieAlert.classList.add("show");
    }
    acceptCookies.addEventListener("click", function () {
        setCookie("acceptCookies", true, 365);
        cookieAlert.classList.remove("show");
        window.dispatchEvent(new Event("cookieAlertAccept"))
    });

    document.querySelector(".cookie-options").addEventListener("click", _ => {
        let modal = new Modal(
            "#modal-wrapper",
            {
                title: "Cookie Info",
                centered: true,
                static_backdrop: true
            },
            "large"
        )
        modal.Custom(`
            <p>
                We use cookies to perform various functions on our webpage. <br>
                Thus they are vital for this site to function. <br><br>
                If you want to know more about what cookies do, you can watch the <a class="text-info" href="http://cookiesandyou.com/" target="_blank">Cookie Video</a>.
            </p>
            <p>
                Should you not want to receive our cookies, you may have to leave this website.<br>
                You can also refer to our <a href="/legal/privacy" target="_blank">Privacy Policy</a> for more info on how we in particular use cookies.
            </p>
        `)
        modal.Button(
            "cl_btn",
            "I understand and Accept",
            "btn btn-primary",
            {},
            true
        ).addEventListener("click", _ => {
            modal.destroy()
            document.querySelector(".acceptcookies").click()
        })
        modal.Button(
            "cl_btn2",
            "Leave this page",
            "btn btn-danger",
            {},
            true
        ).addEventListener("click", _ => {
            modal.destroy()
            location.href = "/clear-cookies/html"
        })
        modal.show()
    })

})();
