import os
import requests
import platform

from flask import Flask, make_response

DEBUG = platform.system() == 'Windows'
API_URL = 'https://api.software-city.org/app/'


def make_api_request(path):
    response = requests.get(API_URL + path, timeout=2, verify=False)
    return response.json() if response.status_code in [200, 204] else None


def run_as_user(user, command, exit_code=0):
    return os.system(f"runuser -l {user} -c 'cd ~ && {command}'") == exit_code


cmds = {
    "power": {
        "shutdown": "/root/stopall.sh start && shutdown now",
        "reboot": "/root/stopall.sh start && reboot"
    },
    "service": {
        "apache2": {
            "status": "service apache2 status",
            "start": "service apache2 start",
            "stop": "service apache2 stop",
            "restart": "service apache2 restart"
        },
        "mysql": {
            "status": "service mysql status",
            "start": "service mysql start",
            "stop": "service mysql stop",
            "restart": "service mysql restart"
        }
    },
    "servers": {
        "teamspeak": {
            "status": lambda: make_api_request("get_ts") is not None,
            "start": lambda: run_as_user("teamspeak", "./start.sh"),
            "stop": lambda: run_as_user("teamspeak", "./stop.sh"),
            "restart": lambda: run_as_user("teamspeak", "./restart.sh"),
        },
        "minecraft": {
            "status": lambda: make_api_request("get_mc") is not None,
            "start": lambda: run_as_user("minecraft", "./start.sh"),
            "stop": lambda: run_as_user("minecraft", "./stop.sh"),
            "restart": lambda: run_as_user("minecraft", "./restart.sh"),
        },
        "steam": {
            "status": lambda: run_as_user("steam", "screen -ls | grep se"),
            "start": lambda: run_as_user("steam", "./start.sh"),
            "stop": lambda: run_as_user("steam", "./stop.sh"),
            "restart": lambda: run_as_user("steam", "./restart.sh"),
        }
    }
}


app = Flask(__name__)


@app.route("/power/<cmd>")
def cmd_handler(cmd):
    try:

        return make_response({
            "exit_code": os.system(cmds["power"][cmd])
        }, 200)
    except KeyError:
        return make_response("Unknown command", 400)


@app.route("/service/<service>/<cmd>")
def service_cmd_handler(service, cmd):
    try:
        return make_response({
            "exit_code": os.system(cmds["service"][service][cmd])
        }, 200)
    except KeyError or AttributeError:
        return make_response("Unknown command", 400)


@app.route("/servers/<server>/<cmd>")
def server_cmd_handler(server, cmd):
    try:
        return make_response({
            "success": cmds["servers"][server][cmd]()
        }, 200)
    except KeyError:
        return make_response("Unknown command", 400)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=7556, debug=DEBUG)
