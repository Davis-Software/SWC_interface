from __init__ import *
from user_data.user_auth import auth_required, is_admin
from utils import api_utils
from user_data import user_repo


def manage_permissions(username):
    return is_admin(username)


@app.route("/profile")
@auth_required
def profile():
    return render_template(
        "user/user_profile.html",
        profile=user_repo.get_user_query_object(session.get("username"))
    )


@app.route("/profile/settings", methods=["GET", "POST"])
@auth_required
def profile_settings():
    if request.method == "POST":
        if "change_avatar" in request.form:
            user_repo.change_avatar(
                session.get("username"),
                request.files.get("avatar")
            )
        if "edit_description" in request.form:
            user_repo.change_description(
                session.get("username"),
                request.form.get("description")
            )
        if "set_setting" in request.args:
            user_repo.apply_user_settings(
                session.get("username"),
                request.form.get("settings")
            )
        if "change_password" in request.form:
            return api_utils.craft_boolean_response(
                user_repo.change_password(
                    session.get("username"),
                    request.form.get("old_password"),
                    request.form.get("new_password")
                ),
                error_code=RequestCode.Success.OK
            )
        if "delete_data" in request.form:
            cmd = request.form.get("delete_data")
            if cmd == "account":
                user_repo.delete_user(session.get("username"))
                return redirect("/logout")

        return api_utils.empty_success()
    return render_template("user/user_settings.html")


@app.route("/user/<username>")
def user(username):
    if not user_repo.user_exists(username):
        abort(404)
    if username == session.get("username"):
        return redirect("/profile")

    return render_template(
        "user/user_profile.html",
        profile=user_repo.get_user_query_object(username)
    )


@app.route("/user/<application>/<name>")
def user_by_application(application, name):
    user_obj = user_repo.get_user_by_application(
        application, name
    )
    if user_obj:
        return user(user_obj.username)

    return user("None")


@app.route("/user", methods=["GET", "POST"])
def user_info():
    if request.method == "POST":
        if not manage_permissions(session.get("username")):
            return abort(RequestCode.ClientError.Unauthorized)

        if "suspend_user" in request.form:
            user_repo.suspend_user(
                request.form.get("suspend_user"),
                request.form.get("suspend_until"),
                request.form.get("suspend_message")
            )

        if "un_suspend_user" in request.form:
            user_repo.del_suspend_user(
                request.form.get("un_suspend_user")
            )

        if "delete_user" in request.form:
            user_repo.delete_user(
                request.form.get("delete_user")
            )
        if "switch_admin" in request.form:
            user_repo.switch_admin(
                request.form.get("switch_admin")
            )

        return api_utils.empty_success()

    if "avatar" in request.args:
        return user_repo.get_user_query_object(request.args.get("avatar")).get_avatar(html=True)

    if "app_avatar" in request.args:
        return user_repo.get_avatar_by_application(
            request.args.get("app"),
            request.args.get("app_avatar")
        )

    return make_response({}, RequestCode.ClientError.BadRequest)
