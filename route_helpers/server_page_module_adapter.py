import os
from config import page_config, defaults
from __init__ import working_dir
from server_settings.db_integration import server_settings_repo


def get_modules(admin=False):
    def make_module_elem(mod_id, description):
        if description is None:
            description = [mod_id, "No description - Please set one in the interface config/page_config.py file!", False]
        return {
            "id": mod_id,
            "name": description[0],
            "description": description[1],
            "admin": description[2]
        }

    modules = list(map(
        lambda name: name.replace(".html", ""),
        os.listdir(os.path.join(working_dir, "templates/components/server/modules"))
    ))

    module_list = list()
    for mod in modules:
        if not admin and page_config.server_page_modules.get(mod)[2]:
            continue
        module_list.append(make_module_elem(
            mod,
            page_config.server_page_modules.get(mod),
        ))

    return module_list


def get_settings(keys):
    resp = dict()
    for key in keys:
        resp[key] = server_settings_repo.get_setting(key) or defaults.server_settings_defaults.get(key)
    return resp


def set_setting(key, value):
    if value is not None:
        server_settings_repo.set_setting(key, value)

