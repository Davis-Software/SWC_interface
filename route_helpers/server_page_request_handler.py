from __init__ import render_template
from user_data import user_auth
from route_helpers import server_page_module_adapter
from utils import api_utils


def handle_arguments(request, session):
    if request.method == "POST":
        if "set_setting" in request.args:
            json = request.form
            server_page_module_adapter.set_setting(
                json.get("key"),
                json.get("value")
            )

        return api_utils.empty_success()

    if request.args.get("get_settings"):
        return server_page_module_adapter.get_settings(
            request.args.get("get_settings").split(",")
        )

    if request.args.get("get") is not None:
        return render_template(f"components/server/modules/{request.args.get('get')}.html")

    return render_template(
        "pages/server.html",
        modules=server_page_module_adapter.get_modules(user_auth.is_admin(
            session.get("username")
        ))
    )


def handle_module_request(module, request, session):
    return render_template(f"components/server/modules/{module}.html")
