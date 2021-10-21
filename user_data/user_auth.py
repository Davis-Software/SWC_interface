from functools import wraps
from __init__ import *

from .user_repo import *


def is_admin(username):
    return get_user_query_object(username).get_admin()


def is_cloud(username):
    return get_user_query_object(username).get_cloud()


def auth_required(func):
    @wraps(func)
    def check(*args, **kwargs):
        authentication = False
        s_key = False
        username = None

        if request.cookies.get('s_key') or request.args.get("s_key"):
            authentication = str(crypto.decrypt(bytes(request.cookies.get('s_key') or request.args.get("s_key"), "utf-8")), "utf-8") == app.secret_key
            s_key = True

        if session.get("logged_in") and session.get("username") is not None:
            username = session.get("username")
            if check_user_passwordhash(username, session[username]):
                authentication = True

        if authentication:
            if s_key or not get_user_query_object(username).get_suspended():
                if args != () or kwargs is not {}:
                    return func(*args, **kwargs)
                return func()
            return render_template("suspended.html")
        return render_template("login.html", redirect=request.path)

    return check


def cloud_required(func):
    @wraps(func)
    def check(*args, **kwargs):
        authentication = False
        if session.get("logged_in") and session.get("username") is not None:
            username = session.get("username")
            authentication = is_cloud(username)

        if authentication:
            if args != () or kwargs is not {}:
                return func(*args, **kwargs)
            return func()
        abort(RequestCode.ClientError.Unauthorized)

    return check


def admin_required(func):
    @wraps(func)
    def check(*args, **kwargs):
        if session.get("logged_in") and session.get("username") is not None:
            username = session.get("username")
            authentication = is_admin(username)
        else:
            return render_template("login.html", redirect=request.path)

        if authentication:
            if args != () or kwargs is not {}:
                return func(*args, **kwargs)
            return func()
        abort(RequestCode.ClientError.Unauthorized)

    return check
