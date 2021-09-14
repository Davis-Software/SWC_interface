from __init__ import *
from utils import search_utils
from utils import api_utils


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


@app.route("/search_engine")
def search_engine():
    sorted_return = list()

    search = request.args.get("search")

    if search:
        for hit in search_utils.search_all_by_string(search):
            sorted_return.append(hit)

    if "q-search" in request.args:
        return render_template(
            "search_nav.html",
            hits=sorted_return
        )

    return api_utils.craft_response(
        sorted_return, 200
    )
