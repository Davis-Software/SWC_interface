from __init__ import *
from utils.request_code import RequestCode
from user_data.user_auth import auth_required


@app.route("/")
def index():
    return redirect("/login")


@app.route("/dashboard")
@auth_required
def dashboard():
    if "settings" in request.args:
        return render_template("components/dashboard/settings.html")
    return render_template("pages/dashboard.html")


@app.route("/server")
@auth_required
def server():
    abort(RequestCode.ServerError.NotImplemented)


@app.route("/tools")
@auth_required
def tools():
    abort(RequestCode.ServerError.NotImplemented)
