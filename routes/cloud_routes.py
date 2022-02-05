from __init__ import *
from user_data.user_auth import auth_required
from route_helpers import cloud_request_handler as request_handler
from utils import api_utils


@app.route("/cloud", defaults={"cloud_path": ""}, methods=["GET", "POST"])
@app.route("/cloud/<path:cloud_path>", methods=["GET", "POST"])
@auth_required
def route_cloud(cloud_path):
    if request.args or request.form:
        ret = request_handler.handle_arguments(request.args, request.form, request.files, cloud_path, False)
        return ret or api_utils.empty_success()

    return render_template("pages/cloud.html", personal=False)


@app.route("/personal-cloud", defaults={"cloud_path": ""}, methods=["GET", "POST"])
@app.route("/personal-cloud/<path:cloud_path>", methods=["GET", "POST"])
@auth_required
def route_personal_cloud(cloud_path):
    if request.args or request.form:
        ret = request_handler.handle_arguments(request.args, request.form, request.files, cloud_path, True)
        return ret or api_utils.empty_success()

    return render_template("pages/cloud.html", personal=True)


@app.route("/cloud-info")
@auth_required
def route_cloud_info():
    return request_handler.handle_info_request()


@app.route("/cloud-help")
@auth_required
def route_cloud_help():
    return render_template(
        "components/cloud/cloud_help.html"
    )


@app.route("/shared-cloud")
@app.route("/shared-cloud/<string:file_id>")
def route_shared_cloud(file_id=None):
    if file_id is not None:
        return request_handler.handle_cloud_share(
            file_id
        )

    return request_handler.user_shares(session.get("username"), "public" in request.args)


@app.route("/exposed-cloud/<string:position>")
def route_exposed_cloud(position):
    return request_handler.handle_exposition(
        position
    )
