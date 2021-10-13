import os

import configuration
from __init__ import working_dir
from user_data import user_settings_repo


def set_setting(session, request):
    user_settings_repo.set_setting(session.get("username"), request.args.get("key"), request.get_json().get("value"))


def get_setting(session, request):
    return {"value": user_settings_repo.get_setting(session.get("username"), request.args.get("key"))}


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
    def make_module_elem(mod_id, active, description):
        return {
            "id": mod_id,
            "active": active,
            "name": description[0],
            "description": description[1]
        }

    active_modules = user_settings_repo.get_setting(session.get("username"), "dash_modules").split(",")
    if active_modules == [""]:
        active_modules = []
    all_modules = list(map(
        lambda name: name.replace(".html", ""),
        os.listdir(os.path.join(working_dir, "templates/components/dashboard/modules"))
    ))

    module_list = list()
    for active_mod in active_modules:
        module_list.append(make_module_elem(
            active_mod,
            True,
            configuration.dashboard_module_description[active_mod]
        ))

    if not only_active:
        for mod in all_modules:
            if mod in active_modules:
                continue
            module_list.append(make_module_elem(
                mod,
                False,
                configuration.dashboard_module_description[mod]
            ))

    return module_list

