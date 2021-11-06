from server_settings.db_integration.server_settings import ServerSettings, engine
from utils import sql_utils


def get_setting(key):
    result = engine.engine.execute(f"SELECT value FROM `server_settings` WHERE `key` = '{key}'")  # Doing legacy query stuff because it wouldn't work on webservers any other way
    setting = [row[0] for row in result]
    if setting:
        return setting[0]
    return None


def set_setting(key, value):
    setting = ServerSettings.query.filter_by(key=key).first()
    if setting is not None:
        setting.value = value
    else:
        sql_utils.append_to_db(
            ServerSettings(key, value)
        )
    sql_utils.commit_db()
