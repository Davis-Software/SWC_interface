import os

import uuid
import shutil
import zipfile
import markdown
import tempfile
import configuration
from functools import wraps
from datetime import datetime
from __init__ import RequestCode, send_file, render_template, temp_db, request, make_response
from utils import file_utils, api_utils
from os.path import join, isdir, exists


def file_getter(path: str, personal: bool, user: str, filter_by: str = None):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )

    if not exists(location):
        return [], RequestCode.ClientError.NotFound

    if isdir(location):
        file_list = list()

        def add_to_list(f):
            full = join(location, f)
            file_list.append({
                "name": f,
                "directory": isdir(full),
                "size": file_utils.get_file_size(full),
                "type": file_utils.FileIdentifier(full).file_type_desc,
                "icon": file_utils.FileIdentifier(full).file_type_icon
            })

        if filter_by:
            for path, names, files in os.walk(location):
                for name in files:
                    if filter_by in name:
                        n = str(join(path, name).split(location)[1]).replace("\\", "/")
                        n = n[1:] if n[0] == "/" else n
                        add_to_list(n)
        else:
            for file in os.listdir(location):
                add_to_list(file)

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

        if request.args.get("raw"):
            return returner()
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
def load_file_preview(path: str, personal: bool, user: str, alt_file_type: str = None):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )

    file_type = file_utils.FileIdentifier(location).file_type
    if alt_file_type is not None:
        file_type = alt_file_type

    if file_type == "FILE":
        if request.cookies.get("set-file-type-open") is not None:
            resp = make_response(load_file_preview(
                path, personal, user, alt_file_type=request.cookies.get("set-file-type-file")
            ))
            if request.cookies.get("set-file-type-open") == "yes":
                resp.set_cookie("set-file-type-open", "no")
                return resp
            else:
                if request.args.get("raw"):
                    return resp

        return render_template(
            "components/cloud/previews/ask_how.html",
            file_types=[
                configuration.CloudFileTypes.ALL,
                configuration.CloudFileTypes.DESCRIPTORS
            ]
        )

    elif file_type == "TEXT":
        with open(location, "r", encoding="utf-8") as f:
            data = f.read()
        if request.args.get("raw"):
            return api_utils.craft_response([data, path], RequestCode.Success.OK)
        return render_template("components/cloud/previews/monaco_editor.html")

    elif file_type == "ARCHIVE":
        with zipfile.ZipFile(location, "r") as zf:
            data = zf.infolist()
        content = list()
        for elem in data:
            directory = elem.filename[-1] == "/"
            content.append({
                "name": elem.filename,
                "directory": directory,
                "size": elem.file_size,
                "type": file_utils.FileIdentifier(elem.filename, folder=directory).file_type_desc,
                "icon": file_utils.FileIdentifier(elem.filename, folder=directory).file_type_icon
            })
        return render_template(
            "components/cloud/previews/zip.html",
            content=content
        )

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

    else:
        return make_response({}, RequestCode.ClientError.UnsupportedMediaType)


def download_file(path: str, personal: bool, user: str):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )

    if isdir(location):
        temp_loc = join(
            tempfile.gettempdir() if not configuration.debug_mode else join(configuration.cloud_save_path, "TMP"),
            "swc-cloud"
        )

        if not exists(temp_loc):
            os.makedirs(temp_loc)
        else:
            for file in os.listdir(temp_loc):
                os.remove(join(temp_loc, file))

        temp_loc = join(temp_loc, f"{str(uuid.uuid4())}")
        shutil.make_archive(temp_loc, "zip", location)

        return send_file(f"{temp_loc}.zip"), RequestCode.Success.OK

    return send_file(location)


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
        self.user = user
        self.root = file_utils.make_cloud_path(
            user if personal else "",
            personal
        )
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

    def move_or_copy(self, copy: bool, file: dict):
        if file["path"].split("/")[1] == "personal-cloud":
            path = file_utils.make_cloud_path(join(self.user, "/".join(file["path"].split("/")[2:])), True)
        else:
            path = file_utils.make_cloud_path("/".join(file["path"].split("/")[2:]), False)
        destination = join(self.location, file["name"])
        try:
            if copy:
                if isdir(path):
                    shutil.copytree(path, destination)
                else:
                    shutil.copy2(path, destination)
            else:
                shutil.move(path, destination)
        except shutil.SameFileError:
            pass

    def rename(self, file_name: str, new_name: str):
        os.rename(
            join(self.location, file_name),
            join(self.location, new_name)
        )

    def to_trash(self, file_name: str):
        shutil.move(
            join(self.location, file_name),
            join(self.root, "trash", file_name)
        )

    def delete(self, file_name: str):
        path = join(self.location, file_name)
        if isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)


def cloud_info(user, formatted=False):
    path = file_utils.make_cloud_path(user, True)
    return {
        "size": file_utils.get_file_size(path, formatted, 2, False),
        "count": file_utils.count_files(path)
    }
