from user_data.User import SyncingSettings
from utils import sql_utils
from config import defaults


def set_setting(user, key, value: any):
    loc = SyncingSettings.query.filter_by(username=user, key=key).first()

    if (not value and value != "") and key in defaults.sync_settings_defaults:
        value = str(defaults.sync_settings_defaults[key])
    elif not value and value != "":
        value = None

    if not loc:
        sql_utils.append_to_db(
            SyncingSettings(user, key, value)
        )
    else:
        loc.value = str(value)
    sql_utils.commit_db()


def get_setting(user, key):
    db_result = SyncingSettings.query.filter_by(username=user, key=key).first()
    if db_result or db_result == "":
        return db_result.value
    if key in defaults.sync_settings_defaults:
        return defaults.sync_settings_defaults[key]
    return None
