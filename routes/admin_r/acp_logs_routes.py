from __init__ import *
from user_data.user_auth import admin_required


@app.route("/acp/logs", methods=["GET", "POST"])
@admin_required
def acp_logs():
    if "get_log" in request.args and request.args.get("get_log") in ["input", "output", "error"]:
        return getattr(logger, f"get_console_{request.args.get('get_log')}")()

    return render_template("acp/acp_logs.html")
