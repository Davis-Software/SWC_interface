from __init__ import render_template
from user_data import user_auth
from route_helpers import tools_page_tool_adapter


def handle_arguments(request, session):
    if request.args.get("get") is not None:
        return render_template(f"components/tools/toolkit/{request.args.get('get')}.html")

    return render_template(
        "pages/tools.html",
        tools=tools_page_tool_adapter.get_tools(user_auth.is_admin(
            session.get("username")
        ))
    )


def handle_module_request(module, request, session):
    return render_template(f"components/tools/toolkit/{module}.html")
