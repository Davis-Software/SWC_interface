import json

import configuration
from __init__ import session, abort, temp_db
from route_helpers import cloud_file_adapter as file_adapter
from utils import api_utils
from utils.request_code import RequestCode
from user_data.user_auth import cloud_required
from datetime import datetime, timedelta


@cloud_required
def handle_arguments(args, form, files, c_path: str, personal_cloud: bool):
    user = session.get("username")

    if form or files:
        if "post-create" in args:
            if form.get("type") == "TEXT":
                file_adapter.FileOperation(c_path, personal_cloud, user).new_file(
                    form.get("name")
                )
            elif form.get("type") == "DIR":
                file_adapter.FileOperation(c_path, personal_cloud, user).new_folder(
                    form.get("name")
                )
            return api_utils.empty_success()

        if "post-set" in args:
            ops = file_adapter.FileOperation(c_path, personal_cloud, user)
            if form.get("type") == "TEXT":
                ops.save(form.get("data"))
            return api_utils.empty_success()

        if "post-ops" in args:
            ops = file_adapter.FileOperation(c_path, personal_cloud, user)
            mode = form.get("mode")
            data = json.loads(form.get("data"))
            if mode == "paste":
                for file in data["files"]:
                    ops.move_or_copy(data["mode"], file)
            if mode == "rename":
                ops.rename(data["file"], data["new_name"])
            if mode == "trash":
                for file in data["files"]:
                    ops.to_trash(file["name"])
            if mode == "delete":
                for file in data["files"]:
                    ops.delete(file["name"])

            return api_utils.empty_success()

        if "upload" in args:
            file_adapter.upload_files(c_path, personal_cloud, user, files)
            return api_utils.empty_success()

    if "data" in args:
        return api_utils.craft_response(
            *file_adapter.file_getter(c_path, personal_cloud, user, filter_by=args.get("filter"))
        )
    if "preview" in args:
        return file_adapter.load_file_preview(c_path, personal_cloud, user)
    if "download" in args:
        return api_utils.make_response(
            *file_adapter.download_file(c_path, personal_cloud, user)
        )

    return RequestCode.ClientError.BadRequest


def handle_info_request():
    user = session.get("username")
    data = file_adapter.cloud_info(user)
    data["max"] = configuration.max_cloud_size * 1_000_000_000
    return api_utils.craft_response(data, RequestCode.Success.OK)


def handle_exposition(position):
    if position in temp_db.data["exposed_cloud_files"]:
        if temp_db.data["exposed_cloud_files"][position]["exposed"] > datetime.now() + timedelta(minutes=5):
            abort(RequestCode.ClientError.RequestTimeout)
        return file_adapter.download_exposed_file(position)
    abort(RequestCode.ClientError.NotFound)
