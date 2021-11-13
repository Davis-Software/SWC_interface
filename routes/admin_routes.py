from __init__ import *
from user_data.user_auth import admin_required
from user_data.user_repo import get_all_users


@app.route("/acp")
@admin_required
def acp_index():
    return render_template(
        "acp/acp_index.html",
        users=get_all_users(),
        log=logger.get_console_output()
    )


from .admin_r import acp_user_routes, acp_logs_routes
