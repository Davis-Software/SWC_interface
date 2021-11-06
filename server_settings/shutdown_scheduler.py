import schedule
import holidays
import calendar
import configuration
from datetime import datetime
from config.defaults import server_settings_defaults
from route_helpers.server_page_module_adapter import get_settings


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


def shutdown():
    if configuration.debug_mode:
        return
    print("shutdown")


def set_shutdown_time():
    if not data.get("down-state"):
        return

    schedule.clear("server-shutdown-scheduler")

    now = datetime.now()
    today = calendar.day_name[int(datetime.today().weekday())]

    if data.get("auto-detect") and now in holidays.Germany(years=2021):
        time = data.get("normal-down-auto")

    elif today in ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]:
        time = data.get("holiday-down-week") if data.get("holiday") else data.get("normal-down-week")

    elif today in ["Friday", "Saturday"]:
        time = data.get("holiday-down-weekend") if data.get("holiday") else data.get("normal-down-weekend")

    else:
        time = server_settings_defaults.get("normal-down-week")

    schedule.every().day.at(time).do(shutdown).tag("server-shutdown-scheduler")


def _update_tags():
    global data
    new_data = get_settings(tags)
    if data != new_data:
        data = get_settings(tags)
        set_shutdown_time()


schedule.every(10).seconds.do(_update_tags)
