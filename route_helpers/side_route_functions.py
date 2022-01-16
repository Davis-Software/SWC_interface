from config import defaults
from server_settings.db_integration import server_settings_repo


def get_settings(keys):
    resp = dict()
    for key in keys:
        resp[key] = server_settings_repo.get_setting(key) or defaults.server_settings_defaults.get(key)
    return resp


def set_setting(key, value):
    if value is not None:
        server_settings_repo.set_setting(key, value)