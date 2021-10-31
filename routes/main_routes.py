from __init__ import *
from utils.request_code import RequestCode
from user_data.user_auth import auth_required
from route_helpers import dashboard_request_handler


@app.route("/")
def index():
    return redirect("/login")


@app.route("/dashboard", methods=["GET", "PUT", "PATCH"])
@auth_required
def dashboard():
    return dashboard_request_handler.handle_arguments(request, session)


@app.route("/server")
@auth_required
def server():
    abort(RequestCode.ServerError.NotImplemented)


@app.route("/tools")
@auth_required
def tools():
    abort(RequestCode.ServerError.NotImplemented)
