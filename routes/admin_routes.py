from __init__ import *
from user_data.user_auth import admin_required


@app.route("/acp")
@admin_required
def acp_index():
    return render_template("acp/acp_index.html")


from .admin_r import acp_user_routes
