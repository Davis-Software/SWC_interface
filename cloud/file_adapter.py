import os

import uuid
import markdown
from functools import wraps
from datetime import datetime
from __init__ import RequestCode, send_file, render_template, temp_db, request, make_response
from utils import file_utils, api_utils
from os.path import join, isdir, exists


def file_getter(path: str, personal: bool, user: str):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )

    if not exists(location):
        return [], RequestCode.ClientError.NotFound

    if isdir(location):
        file_list = list()
        for file in os.listdir(location):
            full = join(location, file)
            file_list.append({
                "name": file,
                "directory": isdir(full),
                "size": file_utils.get_file_size(full),
                "type": file_utils.FileIdentifier(full).file_type_desc,
                "icon": file_utils.FileIdentifier(full).file_type_icon
            })
        return file_list, RequestCode.Success.OK

    return {
        "preview_mode": True
    }, RequestCode.Success.OK


def check_for_accepted_preview(func):
    @wraps(func)
    def check(*args, **kwargs):
        def returner():
            if args != () or kwargs is not {}:
                return func(*args, **kwargs)
            return func()

        if request.cookies.get("accepted-preview-warning"):
            if request.cookies.get("accepted-preview-warning") == "forever":
                return returner()
            resp = make_response(returner())
            resp.delete_cookie("accepted-preview-warning")
            return resp
        return render_template(
            "components/cloud/previews/expose_warning.html"
        )

    return check


@check_for_accepted_preview
def load_file_preview(path: str, personal: bool, user: str):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )

    file_type = file_utils.FileIdentifier(location).file_type

    if file_type == "TEXT":
        with open(location, "r", encoding="utf-8") as f:
            data = f.read()
        if request.args.get("raw"):
            return api_utils.craft_response([data, path], RequestCode.Success.OK)
        return render_template("components/cloud/previews/monaco_editor.html")

    elif file_type == "ARCHIVE":
        pass

    elif file_type in ["OPEN_DOCUMENT", "OFFICE_DOCUMENT"]:
        return render_template(
            "components/cloud/previews/ms_docs.html",
            position=expose_cloud_file(location)
        )

    elif file_type == "XHTML":
        with open(location, "r", encoding="utf-8") as f:
            data = f.read()
        if request.args.get("raw"):
            return api_utils.craft_response([data, path], RequestCode.Success.OK)
        return render_template("components/cloud/previews/html_editor.html")

    elif file_type == "MARKDOWN":
        with open(location, "r", encoding="utf-8") as f:
            data = f.read()
            print(data)
        if request.args.get("raw"):
            return api_utils.craft_response([
                data,
                path,
                markdown.markdown(
                    data,
                    extensions=[
                        "extra", "abbr", "attr_list", "def_list", "fenced_code", "footnotes", "md_in_html", "tables",
                        "admonition",
                        "codehilite", "legacy_attrs", "legacy_attrs", "meta", "nl2br", "sane_lists", "smarty", "toc",
                        "wikilinks"
                    ]
                )
            ], RequestCode.Success.OK)
        return render_template("components/cloud/previews/markdown_editor.html")

    elif file_type == "IMAGE":
        return render_template(
            "components/cloud/previews/image.html",
            file_name=path
        )

    elif file_type == "AUDIO":
        return render_template(
            "components/cloud/previews/audio.html",
            file_name=path
        )

    elif file_type == "VIDEO":
        return render_template(
            "components/cloud/previews/video.html",
            file_name=path
        )

    elif file_type == "PDF":
        return render_template(
            "components/cloud/previews/g_docs.html",
            position=expose_cloud_file(location)
        )


def download_file(path: str, personal: bool, user: str):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )

    if isdir(location):
        return {}, RequestCode.ClientError.MisdirectedRequest

    return send_file(location), RequestCode.Success.OK


def upload_files(path: str, personal: bool, user: str, files):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )
    for file in files:
        file = files.get(file)
        file.save(
            join(location, file.filename)
        )


def expose_cloud_file(location):
    print(
        temp_db.data["exposed_cloud_files_positions"],
        temp_db.data["exposed_cloud_files"]
    )
    if location in temp_db.data["exposed_cloud_files_positions"]:
        position = temp_db.data["exposed_cloud_files_positions"][location]
        temp_db.data["exposed_cloud_files"][position] = {
            "target": location,
            "exposed": datetime.now()
        }
        return position

    position = str(uuid.uuid4())
    temp_db.data["exposed_cloud_files_positions"][location] = position
    temp_db.data["exposed_cloud_files"][position] = {
        "target": location,
        "exposed": datetime.now()
    }

    return position


def download_exposed_file(position):
    return send_file(
        temp_db.data["exposed_cloud_files"][position]["target"]
    )


class FileOperation:
    def __init__(self, path: str, personal: bool, user: str):
        self.location = file_utils.make_cloud_path(
            join(user, path) if personal else path,
            personal
        )

    def new_file(self, name: str):
        with open(join(self.location, name), "w", encoding="utf-8") as f:
            f.write("")

    def new_folder(self, name: str):
        os.mkdir(join(
            self.location,
            name
        ))

    def save(self, data: str):
        with open(self.location, "w", encoding="utf-8") as f:
            f.write(data)
