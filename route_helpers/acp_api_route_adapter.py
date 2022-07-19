import os
import configuration


def get_routing(path):
    path = path.replace(configuration.server_api_path, "").replace(".py", "")
    return configuration.server_api_url + path


def get_file_content(path):
    with open(path, "r") as f:
        return {
            "name": os.path.basename(path),
            "type": "file",
            "path": path,
            "route": get_routing(path),
            "content": f.read()
        }


def acquire_api_functions(path):
    files = os.listdir(path)
    folders = os.listdir(path)

    files = filter(lambda x: not os.path.isdir(os.path.join(path, x)) and x.endswith(".py") and not x.startswith("."), files)
    folders = filter(lambda x: os.path.isdir(os.path.join(path, x)) and not x.startswith("_"), folders)

    files = map(lambda x: {
        "name": x,
        "type": "file",
        "route": get_routing(os.path.join(path, x)),
        "path": os.path.join(path, x)
    }, files)
    folders = map(lambda x: {
        "name": x,
        "type": "folder",
        "route": get_routing(os.path.join(path, x)),
        "path": os.path.join(path, x)
    }, folders)

    return folders, files


