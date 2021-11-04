import os
from config import page_config
from __init__ import working_dir


def get_modules(admin=False):
    def make_module_elem(mod_id, description):
        if description is None:
            description = [mod_id, "No description - Please set one in the interface config/page_config.py file!"]
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
        if not admin and page_config.dashboard_module_description.get(mod)[2]:
            continue
        module_list.append(make_module_elem(
            mod,
            page_config.dashboard_module_description.get(mod),
        ))

    return module_list
