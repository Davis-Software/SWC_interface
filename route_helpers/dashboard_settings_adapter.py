import os
import json


import configuration
from __init__ import working_dir, request
from user_data import user_settings_repo


def set_setting(session, req):
    user_settings_repo.set_setting(session.get("username"), req.args.get("key"), req.get_json().get("value"))


def get_setting(session, req):
    return {"value": user_settings_repo.get_setting(session.get("username"), req.args.get("key"))}


def get_setting_var(session, key):
    return user_settings_repo.get_setting(session.get("username"), key)


def get_title_img(session, only_active=False):
    active_img = user_settings_repo.get_setting(session.get("username"), "dash_title_img")
    all_img = os.listdir(os.path.join(working_dir, "static/dashboard/img"))

    if only_active:
        return active_img
    return {
        "active": active_img,
        "all": all_img
    }


def get_modules(session, only_active=False):
    def make_module_elem(mod_id, active, description, d_config):
        return {
            "id": mod_id,
            "active": active,
            "name": description[0],
            "description": description[1],
            "options": {} if len(description) < 3 else description[2],
            "d_conf": d_config
        }

    active_modules = user_settings_repo.get_setting(session.get("username"), "dash_modules").split(",")
    if active_modules == [""]:
        active_modules = []
    all_modules = list(map(
        lambda name: name.replace(".html", ""),
        os.listdir(os.path.join(working_dir, "templates/components/dashboard/modules"))
    ))

    module_list = list()
    active_modules_names = list()
    for active_mod in active_modules:
        mod = active_mod
        conf = {}
        if "::::" in active_mod:
            mod = active_mod.split("::::")[0]
            conf = json.loads(
                active_mod.split("::::")[1]
            )
        active_modules_names.append(mod)
        module_list.append(make_module_elem(
            mod,
            True,
            configuration.dashboard_module_description[mod],
            conf
        ))

    if not only_active:
        for mod in all_modules:
            if mod in active_modules_names:
                continue
            module_list.append(make_module_elem(
                mod,
                False,
                configuration.dashboard_module_description[mod],
                {}
            ))

    return module_list


def get_module_config(session, module):
    user = session.get("username") or request.args.get("username")
    active_modules = user_settings_repo.get_setting(user, "dash_modules").split(",")

    for module_i in active_modules:
        mod = module_i
        config = {}
        if "::::" in module_i:
            mod = module_i.split("::::")[0]
            config = json.loads(
                module_i.split("::::")[1]
            )

        if mod == module:
            return config

    return {}
