import os.path

from flask import render_template

from __init__ import app
import configuration
from route_helpers.acp_api_route_adapter import acquire_api_functions, get_file_content
from user_data.user_auth import admin_required


@app.route('/acp/api/')
@app.route("/acp/api/<path:path>")
@admin_required
def acp_api(path=None):
    if path is None:
        path = configuration.server_api_path
    else:
        path = os.path.join(configuration.server_api_path, path)

    if os.path.isfile(path):
        return render_template("acp/acp_api.html", file=get_file_content(path))

    return render_template("acp/acp_api.html", files=acquire_api_functions(path))

