from __init__ import app
from flask import session, abort

from user_data.user_repo import get_user_query_object
from user_data.user_auth import auth_required
from utils.request_code import RequestCode
from .dashboard.modules import pp_calc


@app.route("/dashboard/module-request/<module>")
@auth_required
def dashboard_module_request(module):
    if module == "pp-calc":
        user = get_user_query_object(session.get("username"))

        if user.get_permission("!pp-calc"):
            abort(403)

        resp = pp_calc.PeePee(user).generate_values().to_json()
        return resp

    return RequestCode.ClientError.NotFound
