from __init__ import *
from user_data import user_repo
from user_data.user_auth import admin_required
from user_data.user_repo import get_user_query_object
from utils.request_code import RequestCode
from utils import api_utils, sql_utils


@app.route("/acp/users", methods=["GET", "POST"])
@admin_required
def acp_users():
    if request.method == "POST":
        if "create_user" in request.form:
            user_repo.create_user(
                request.form.get("name"),
                request.form.get("passwd"),
                request.form.get("desc"),
                request.files.get("pict").stream.read() if request.files.get("pict") is not None else None,
                admin=request.form.get("admin") == "true",
                cloud=request.form.get("cloud") == "true",
                permissions=request.form.get("permissions").split(",")
            )
        if "set_permissions" in request.form:
            user_repo.set_permissions(
                request.form.get("set_permissions"),
                request.form.get("permissions").split(",")
            )
        if "set_password" in request.form:
            user_repo.set_password(
                request.form.get("set_password"),
                request.form.get("password")
            )
        if "remove_user" in request.form:
            user_repo.delete_user(
                request.form.get("remove_user")
            )
        if "suspend_user" in request.form:
            user_repo.suspend_user(
                request.form.get("suspend_user"),
                request.form.get("suspend_until"),
                request.form.get("suspend_message")
            )
        return api_utils.empty_success()

    if "get_users" in request.args:
        return api_utils.craft_response(
            user_repo.get_all_users(),
            RequestCode.Success.OK
        )
    if "get_user" in request.args:
        return api_utils.craft_response(
            sql_utils.sql_to_json(
                user_repo.get_user_query_object(
                    request.args.get("get_user")
                )
            ),
            RequestCode.Success.OK
        )

    return render_template("acp/acp_users.html")


@app.route("/acp/user/emulate/<user_name>")
@admin_required
def acp_user_emulate(user_name):
    user = get_user_query_object(session.get("username"))

    if not user.get_permission("emulate"):
        abort(RequestCode.ClientError.Forbidden)

    resp = make_response(redirect(
        request.args.get("redirect") or "/dashboard"
    ))

    session["logged_in"] = True
    session["username"] = user_name
    session[user_name] = user_repo.get_password_hash(user_name)
    session.permanent = True

    return resp
