import configuration
import os
from os.path import join, getsize, isdir

cloud_path = join(configuration.cloud_save_path, configuration.public_cloud_folder)
personal_cloud_path = join(configuration.cloud_save_path, configuration.personal_cloud_folder)


class FileIdentifier:
    def __init__(self, file: str):
        file_name = file.split("/")[-1].split("/")[-1]
        file_type = file_name.split(".")[-1] if "." in file_name else ""

        self.file_name = file_name
        self.file_type = "Directory" if isdir(file) else self.identify(file_type)
        self.file_extension = "Directory" if isdir(file) else file_type
        self.file_type_desc = "Directory" if isdir(file) else self.file_type_description(self.file_type)
        self.file_type_icon = "folder" if isdir(file) else self.file_type_icon_image(self.file_type)

    @staticmethod
    def identify(typ):
        for file_type in configuration.CloudFileTypes.ALL:
            if typ in getattr(configuration.CloudFileTypes, file_type):
                return file_type

        return "FILE"

    @staticmethod
    def file_type_description(dict_key):
        return configuration.CloudFileTypes.DESCRIPTORS.get(dict_key)

    @staticmethod
    def file_type_icon_image(dict_key):
        return configuration.CloudFileTypes.ICONS.get(dict_key)


def make_cloud_path(path: str, personal: bool):
    return join(
        personal_cloud_path if personal else cloud_path,
        path
    )


def get_file_size(path: str, formatted: bool = True, round_to: int = 1):
    file_size = getsize(path)

    if isdir(path):
        cycle = 0
        for dir_path, _, file_names in os.walk(path):
            if cycle > 5:
                file_size = 4069
                break
            for i in file_names:
                f = join(dir_path, i)
                file_size += getsize(f)
                cycle += 1

    if not formatted:
        return round(file_size, round_to)

    power = 2 ** 10
    n = 0
    power_labels = {
        0: "Bytes",
        1: "KB",
        2: "MB",
        3: "GB",
        4: "TB"
    }
    while file_size > power:
        file_size /= power
        n += 1

    return f"{round(file_size, round_to)} {power_labels[n]}"


# def
