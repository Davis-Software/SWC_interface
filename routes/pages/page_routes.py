from __init__ import app
from flask import session, abort

from user_data.user_auth import auth_required
from utils.request_code import RequestCode
from .dashboard.modules import pp_calc


@app.route("/dashboard/module-request/<module>")
@auth_required
def dashboard_module_request(module):
    if session.get("username") == "EiswaffelGHG":
        abort(RequestCode.ClientError.Forbidden)

    if module == "pp-calc":
        resp = pp_calc.PeePee(session.get("username")).generate_values().to_json()
        return resp

    return RequestCode.ClientError.NotFound
