from __init__ import session, abort
from cloud import file_adapter
from utils import api_utils
from utils.request_code import RequestCode
from user_data.user_auth import cloud_required


@cloud_required
def handle_arguments(args, form, c_path: str, personal_cloud: bool):
    user = session.get("username")

    if form:
        if "post-set" in args:
            ops = file_adapter.FileOperation(c_path, personal_cloud, user)
            if form.get("type") == "TEXT":
                ops.save(form.get("data"))

        return api_utils.empty_success()

    if "post-set" in args:
        abort(RequestCode.ClientError.MethodNotAllowed)

    if "data" in args:
        return api_utils.craft_response(
            *file_adapter.file_getter(c_path, personal_cloud, user)
        )
    if "preview" in args:
        return file_adapter.load_file_preview(c_path, personal_cloud, user)
    if "download" in args:
        return api_utils.make_response(
            *file_adapter.download_file(c_path, personal_cloud, user)
        )
