from __init__ import render_template
from user_data import user_auth
from route_helpers import server_page_module_adapter


def handle_arguments(request, session):
    if request.args.get("get") is not None:
        return render_template(f"components/server/modules/{request.args.get('get')}.html")

    if request.args.get("get-image") is not None:
        return server_page_module_adapter.get_image(
            request.args.get("get-image")
        )

    return render_template(
        "pages/server.html",
        modules=server_page_module_adapter.get_modules(user_auth.is_admin(
            session.get("username")
        ))
    )


def handle_module_request(module, request, session):
    return render_template(f"components/server/modules/{module}.html")
