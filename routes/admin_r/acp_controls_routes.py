from flask import render_template

from __init__ import app
from route_helpers import acp_controls_adapter
from server_settings.server_control import PowerOptions
from user_data.user_auth import admin_required
from utils import api_utils


@app.route("/acp/controls")
@app.route("/acp/controls/<string:option>/<string:operation>")
@admin_required
def acp_controls(option=None, operation=None):
    if option == "power":
        if operation == "shutdown":
            PowerOptions.shutdown()
        elif operation == "reboot":
            PowerOptions.reboot()
        return api_utils.empty_success()

    return render_template(
        "acp/acp_controls.html",
        controls=acp_controls_adapter.get_controls(),
        ops=acp_controls_adapter.get_ops()
    )


@app.route("/acp/controls/<string:mode>/<string:name>/<string:cmd>")
@admin_required
def acp_controls_cmd(mode, name, cmd):
    return acp_controls_adapter.call_control_cmd(mode, name, cmd)
