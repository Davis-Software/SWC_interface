from server_settings.db_integration.server_settings import ServerSettings, ButterChurnWeights, engine
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


# Butterchurn weights
def butter_churn_weight_up(key: str):
    weight = ButterChurnWeights.query.filter_by(key=key).first()
    if weight is not None:
        weight.weight += 1
    else:
        sql_utils.append_to_db(
            ButterChurnWeights(key, 1)
        )
    sql_utils.commit_db()


def butter_churn_weight_down(key: str):
    weight = ButterChurnWeights.query.filter_by(key=key).first()
    if weight is not None:
        weight.weight -= 1
    else:
        sql_utils.append_to_db(
            ButterChurnWeights(key, -1)
        )
    sql_utils.commit_db()


def butter_churn_weight_get(key: str = None):
    if key is None:
        return sql_utils.sql_list_to_json(ButterChurnWeights.query.all())
    else:
        weight = ButterChurnWeights.query.filter_by(key=key).first()
        if weight is not None:
            return sql_utils.sql_to_json(weight)
        else:
            return None
