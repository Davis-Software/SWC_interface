from server_settings.db_integration.server_settings import ServerSettings
from utils import sql_utils


def get_setting(key):
    setting = ServerSettings.query.filter_by(key=key).first()
    if setting is None:
        return setting
    return setting.value


def set_setting(key, value):
    setting = ServerSettings.query.filter_by(key=key).first()
    if setting is not None:
        setting.value = value
    else:
        sql_utils.append_to_db(
            ServerSettings(key, value)
        )
    sql_utils.commit_db()
