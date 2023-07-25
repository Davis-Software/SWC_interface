import schedule
import holidays
import calendar
from datetime import datetime

from server_settings.server_control import PowerOptions
from config.defaults import server_settings_defaults
from route_helpers.side_route_functions import get_settings


scheduled = list()


tags = [
    "down-state",
    "holiday",
    "auto-detect",
    "normal-down-week",
    "normal-down-weekend",
    "normal-down-auto",
    "holiday-down-week",
    "holiday-down-weekend"
]
data = get_settings(tags)


def set_shutdown_time():
    if data.get("down-state") == "false":
        return

    schedule.clear("server-shutdown-scheduler")

    now = datetime.now()
    today = calendar.day_name[int(datetime.today().weekday())]
    holiday = data.get("holiday") == "true"

    if data.get("auto-detect") and now in holidays.Germany(years=2021):
        time = data.get("normal-down-auto")

    elif today in ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]:
        time = data.get("holiday-down-week") if holiday else data.get("normal-down-week")

    elif today in ["Friday", "Saturday"]:
        time = data.get("holiday-down-weekend") if holiday else data.get("normal-down-weekend")

    else:
        time = server_settings_defaults.get("normal-down-week")

    schedule.every().day.at(time).do(PowerOptions.shutdown).tag("server-shutdown-scheduler")


def _update_tags():
    global data
    new_data = get_settings(tags)
    if data != new_data:
        data = get_settings(tags)
        set_shutdown_time()


schedule.every(10).seconds.do(_update_tags)
