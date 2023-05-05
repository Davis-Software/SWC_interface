from __init__ import *

from route_helpers import side_route_functions
from server_settings.db_integration.server_settings_repo import butter_churn_weight_get, butter_churn_weight_up, \
    butter_churn_weight_down

from user_data import user_auth
from utils import api_utils


@app.route("/favicon")
@app.route("/favicon.ico")
@app.route("/favicon.png")
def asset_favicon():
    return send_from_directory(f"{app.root_path}/static/", "favicon.png", mimetype="image/vnd.microsoft.icon")


@app.route("/server-settings", methods=["GET", "POST"])
def server_settings():
    if request.method == "POST" and user_auth.is_auth():
        if "set_setting" in request.args:
            json_data = request.form
            side_route_functions.set_setting(
                json_data.get("key"),
                json_data.get("value")
            )

        return api_utils.empty_success()

    if not request.args.get("get_settings"):
        return None

    return side_route_functions.get_settings(
        request.args.get("get_settings").split(",")
    )


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


# Butter Churn
@app.route("/butter-churn", methods=["GET"])
@app.route("/butter-churn/<key>", methods=["GET"])
@user_auth.auth_required
def butter_churn(key=None):
    return butter_churn_weight_get(int(key) if key else None)


@app.route("/butter-viz/vote", methods=["POST"])
@user_auth.auth_required
def butter_viz_vote():
    mode = request.form.get("mode")
    key = request.form.get("key")

    if mode == "up":
        butter_churn_weight_up(key)
    elif mode == "down":
        butter_churn_weight_down(key)

    return api_utils.empty_success()
