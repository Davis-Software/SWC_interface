from __init__ import *
from user_data import user_repo

from utils import api_utils
import uuid


@app.route("/login", methods=["GET", "POST"])
def login():
    redirection = request.args.get("goto_confirm") or "/dashboard"

    if "logged_in" in session and session["logged_in"]:
        return redirect(redirection)

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        state = user_repo.check_user_password(username, password)

        if state:
            session["logged_in"] = True
            session["username"] = username
            session[username] = user_repo.get_password_hash(username)
            session.permanent = True
            if not user_repo.get_user_query_object(username).get_suspended():
                return redirect(redirection)
            return render_template("suspended.html")

        return make_response(
            render_template("login.html", error="Wrong username or password"),
            RequestCode.ClientError.Unauthorized
        )

    return render_template("login.html", redirect=request.args.get("goto_confirm") or "/")


@app.route("/logout")
def logout():
    session["logged_in"] = None
    if session.get("username") is not None:
        username = session["username"]
        session[username] = None
        session["username"] = None
    return redirect("/")
