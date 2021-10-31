import os

import configuration
from __init__ import RequestCode, render_template, application_url, working_dir, send_file, make_response
from utils import api_utils
from route_helpers import dashboard_settings_adapter


def handle_arguments(request, session):
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
            config=dashboard_settings_adapter.get_module_config(session, request.args.get("module"))
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
