from flask import render_template

from __init__ import app, logger
from server_settings.server_info import get_server_info, get_server_status
from user_data.user_auth import admin_required
from user_data.user_repo import get_all_users


@app.route("/acp")
@admin_required
def acp_index():
    return render_template(
        "acp/acp_index.html",
        users=get_all_users(),
        log=logger.get_console_output(),
        system={
            "info": get_server_info(),
            "status": get_server_status()
        }
    )


from .admin_r import acp_api_routes, acp_user_routes, acp_controls_routes, acp_console_routes, acp_logs_routes
