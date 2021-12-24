from __init__ import *
from user_data.user_auth import auth_required

from route_helpers import dashboard_request_handler
from route_helpers import server_page_request_handler
from route_helpers import tools_page_request_handler


@app.route("/")
def index():
    return redirect("/login")


@app.route("/dashboard", methods=["GET", "PUT", "PATCH"])
@auth_required
def dashboard():
    return dashboard_request_handler.handle_arguments(request, session)


@app.route("/server", methods=["GET", "POST"])
@auth_required
def server():
    return server_page_request_handler.handle_arguments(request, session)


@app.route("/tools", methods=["GET", "PUT"])
@auth_required
def tools():
    return tools_page_request_handler.handle_arguments(request, session)
