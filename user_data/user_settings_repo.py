from User import SyncingSettings
from utils import sql_utils


def set_setting(user, key, value):
    loc = SyncingSettings.query.filter_by(username=user, key=key).first()
    if not loc:
        sql_utils.append_to_db(
            SyncingSettings(user, key, value)
        )
    else:
        loc.value = value
    sql_utils.commit_db()


def get_setting(user, key):
    return SyncingSettings.query.filter_by(username=user, key=key).first().value
