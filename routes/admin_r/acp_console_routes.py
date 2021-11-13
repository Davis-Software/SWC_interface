from __init__ import *
from user_data.user_auth import admin_required
from server_settings.console import cmd_adapter
from utils import api_utils


@app.route("/acp/console", methods=["GET", "POST"])
@admin_required
def acp_console():
    if "exc_cmd" in request.form:
        cmd_out = cmd_adapter.exc_command(
            request.form.get("exc_cmd")
        )
        return api_utils.craft_response(
            {
                "exc_code": cmd_out[0],
                "output": cmd_out[1]
            },
            RequestCode.ClientError.NotAcceptable if cmd_out[0] == -1 else RequestCode.Success.OK
        )

    return render_template("acp/acp_console.html")
