from __init__ import *


@app.route("/favicon")
@app.route("/favicon.ico")
@app.route("/favicon.png")
def asset_favicon():
    return send_from_directory(f"{app.root_path}/static/", "favicon.png", mimetype="image/vnd.microsoft.icon")


@app.route("/clear-cookies", defaults={"mode": "json"})
@app.route("/clear-cookies/<mode>")
def clear_cookies(mode):
    cookies = request.cookies.items()

    cookie_list = list()
    for cookie in cookies:
        cookie_list.append({"name": cookie[0], "value": cookie[1]})

    if mode == "json":
        data = {"cleared_cookies": cookie_list}
    else:
        data = render_template(
            "cookies-cleared.html",
            cleared_cookies=cookie_list
        )
    response = make_response(data, RequestCode.Success.OK)

    for cookie in cookies:
        response.delete_cookie(cookie[0])

    return response
