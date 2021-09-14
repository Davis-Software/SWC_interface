from __init__ import *
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
    return render_template()


@app.route("/tools")
def tools():
    return render_template()
