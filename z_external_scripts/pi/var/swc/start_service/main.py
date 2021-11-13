import time
import schedule
import calendar
import holidays
import RPi.GPIO as GPIO
from datetime import datetime


import defaults
import service_config
import request_module


GPIO.setmode(GPIO.BCM)
GPIO.setup(service_config.relay_gpio, GPIO.OUT)

boot_up_times = defaults.start_times_default


def startup(wait_after: int = 90):
    print("starting...")
    GPIO.output(service_config.relay_gpio, GPIO.HIGH)
    time.sleep(0.5)
    GPIO.output(service_config.relay_gpio, GPIO.LOW)
    time.sleep(wait_after)


def set_scheduler():
    schedule.clear("server-startup-scheduler")

    now = datetime.now()
    today = calendar.day_name[int(datetime.today().weekday())]
    holiday = boot_up_times.get("holiday") == "true"

    if boot_up_times.get("auto-detect") and now in holidays.Germany(years=2021):
        t = boot_up_times.get("normal-up-auto")

    elif today in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
        t = boot_up_times.get("holiday-up-week") if holiday else boot_up_times.get("normal-up-week")

    elif today in ["Saturday", "Sunday"]:
        t = boot_up_times.get("holiday-up-weekend") if holiday else boot_up_times.get("normal-up-weekend")

    else:
        t = defaults.start_times_default.get("normal-up-week")

    schedule.every().day.at(t).do(startup).tag("server-startup-scheduler")


def update_times(*_):
    pot_new = request_module.get_tag_config(
        defaults.requested_settings_tags
    )

    if pot_new is None:
        return

    print(f"Updated startup info from {boot_up_times} to {pot_new}")
    reset = False
    for val in pot_new:
        if pot_new[val] == boot_up_times[val]:
            continue
        boot_up_times[val] = pot_new[val]
        reset = True

    if reset:
        print("resetting scheduler")
        set_scheduler()
        print("scheduler reset")


schedule.every(15).minutes.do(update_times)
update_times()


if __name__ == "__main__":
    while True:
        schedule.run_pending()
        time.sleep(0.5)
