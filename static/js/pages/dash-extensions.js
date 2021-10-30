const app_fetch = (url, options) => {
    let url_extender = url.includes("?") ? "&" : "?"
    return fetch(`${url}${url_extender}s_key=${getCookie("s_key")}`, options)
}