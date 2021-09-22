from __init__ import *
from utils.request_code import RequestCode
from user_data.user_auth import auth_required, is_admin


@app.route("/")
def index():
    return redirect("/login")


@app.route("/dashboard")
@auth_required
def dashboard():
    return render_template("pages/dashboard.html")


@app.route("/server")
def server():
    abort(RequestCode.ServerError.NotImplemented)


@app.route("/tools")
def tools():
    abort(RequestCode.ServerError.NotImplemented)
