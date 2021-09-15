from __init__ import *
from user_data.user_auth import auth_required
from cloud import request_handler
from utils import api_utils


@app.route("/cloud", defaults={"cloud_path": ""}, methods=["GET", "POST"])
@app.route("/cloud/<path:cloud_path>", methods=["GET", "POST"])
@auth_required
def route_cloud(cloud_path):
    if request.args or request.form:
        ret = request_handler.handle_arguments(request.args, request.form, cloud_path, False)
        return ret or api_utils.empty_success()

    return render_template("pages/cloud.html", personal=False)


@app.route("/personal-cloud", defaults={"cloud_path": ""}, methods=["GET", "POST"])
@app.route("/personal-cloud/<path:cloud_path>", methods=["GET", "POST"])
@auth_required
def route_personal_cloud(cloud_path):
    if request.args or request.form:
        ret = request_handler.handle_arguments(request.args, request.form, cloud_path, True)
        return ret or api_utils.empty_success()

    return render_template("pages/cloud.html", personal=True)


@app.route("/exposed-cloud/<string:position>")
def route_exposed_cloud(position):
    return request_handler.handle_exposition(
        position
    )
