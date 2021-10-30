import os

from __init__ import *
from utils.request_code import RequestCode
from utils import api_utils
from user_data.user_auth import auth_required
from route_helpers import dashboard_settings_adapter


@app.route("/")
def index():
    return redirect("/login")


@app.route("/dashboard", methods=["GET", "PUT", "PATCH"])
@auth_required
def dashboard():
    if request.method == "PATCH" and request.args.get("set") is not None:
        dashboard_settings_adapter.set_setting(session, request)
        return api_utils.make_response({}, RequestCode.Success.OK)

    if "get" in request.args:
        return api_utils.craft_response(
            dashboard_settings_adapter.get_setting(session, request),
            RequestCode.Success.OK
        )
    if "module" in request.args:
        return render_template(
            f"components/dashboard/modules/{request.args.get('module')}.html",
            query_url=f"https://{application_url}",
            config=dashboard_settings_adapter.get_module_config(session, request)
        )
    if "title_img" in request.args:
        if request.args.get("title_img") == "default":
            img = configuration.sync_settings_defaults.get("dash_title_img")
        else:
            img = request.args.get("title_img")
        file = os.path.join(working_dir, 'static/dashboard/img', img)
        if os.path.isfile(file) and os.path.exists(file):
            return send_file(file)
        return make_response("No such file or directory", RequestCode.ClientError.NotFound)

    # Pages
    if "settings" in request.args:
        return render_template(
            "components/dashboard/settings.html",
            title_img=dashboard_settings_adapter.get_title_img(session),
            dash_modules=dashboard_settings_adapter.get_modules(session)
        )

    modules = list()
    for module in dashboard_settings_adapter.get_modules(session, only_active=True):
        modules.append(
            render_template(
                f"components/dashboard/modules/{module['id']}.html",
                config=dashboard_settings_adapter.get_module_config(session, module['id'])
            )
        )
    return render_template(
        "pages/dashboard.html",
        title_img=dashboard_settings_adapter.get_title_img(session, only_active=True),
        dash_modules=modules
    )


@app.route("/server")
@auth_required
def server():
    abort(RequestCode.ServerError.NotImplemented)


@app.route("/tools")
@auth_required
def tools():
    abort(RequestCode.ServerError.NotImplemented)
