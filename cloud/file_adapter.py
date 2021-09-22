import os

import uuid
from datetime import datetime
from __init__ import RequestCode, send_file, render_template, temp_db
from utils import file_utils
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
                "type": file_utils.FileIdentifier(full).file_type_desc
            })
        return file_list, RequestCode.Success.OK

    return {
        "preview_mode": True
    }, RequestCode.Success.OK


def load_file_preview(path: str, personal: bool, user: str):
    location = file_utils.make_cloud_path(
        join(user, path) if personal else path,
        personal
    )

    file_type = file_utils.FileIdentifier(location).file_type

    if file_type == "TEXT":
        with open(location, "r") as f:
            data = f.read()
        return render_template(
            "components/cloud/previews/monaco_editor.html",
            file_name=path,
            file_content=data
        )

    elif file_type == "ARCHIVE":
        pass

    elif file_type in ["OPEN_DOCUMENT", "OFFICE_DOCUMENT"]:
        return render_template(
            "components/cloud/previews/ms_docs.html",
            position=expose_cloud_file(location)
        )

    elif file_type == "XHTML":      # must add feature to view html and rendered
        with open(location, "r") as f:
            data = f.read()
        return render_template(
            "components/cloud/previews/monaco_editor.html",
            file_name=path,
            file_content=data
        )

    elif file_type == "MARKDOWN":
        with open(location, "r") as f:  # same as above
            data = f.read()
        return render_template(
            "components/cloud/previews/monaco_editor.html",
            file_name=path,
            file_content=data
        )

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
            "components/cloud/previews/pdf.html"
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
        with open(join(self.location, name), "w") as f:
            f.write("")

    def new_folder(self, name: str):
        os.mkdir(join(
            self.location,
            name
        ))

    def save(self, data: str):
        with open(self.location, "w") as f:
            f.write(data)
