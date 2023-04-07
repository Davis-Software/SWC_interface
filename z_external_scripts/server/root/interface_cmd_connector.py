import os
import requests
import platform

from flask import Flask, make_response

DEBUG = platform.system() == 'Windows'
API_URL = 'https://api.software-city.org/app/'

DEFAULT_SERVICE_OPS = ['start', 'restart', 'stop', 'status', 'enable', 'disable']
PROTECTED_SERVICE_OPS = ['start', 'restart', 'status']
ALL_OPS = {
    "start": {"color": "success", "text": "Start"},
    "stop": {"color": "danger", "text": "Stop"},
    "restart": {"color": "warning", "text": "Restart"},
    "status": {"color": "info", "text": "Status"},
    "enable": {"color": "secondary", "text": "Enable"},
    "disable": {"color": "secondary", "text": "Disable"},
}


def make_api_request(path):
    response = requests.get(API_URL + path, timeout=2, verify=False)
    return (None if ("status" in response.json() and not response.json()["status"]) else response.json()) if response.status_code in [200, 204] else None


def generate_service_ops(service, ops):
    resp = dict()
    for op in ops:
        resp[op] = f"service {service} {op}"
    return resp


def run_as_user(user, command, exit_code=0):
    if user == 'root':
        return os.system(f"cd ~ && {command}") == exit_code
    return os.system(f"runuser -l {user} -c 'cd ~ && {command}'") == exit_code


private_cmds = {
    "power": {
        "shutdown": "/root/stopall.sh start && shutdown now",
        "reboot": "/root/stopall.sh start && reboot"
    }
}
cmds = {
    "service": {
        "satisfactory": generate_service_ops("satisfactory", DEFAULT_SERVICE_OPS),
        "apache2": generate_service_ops("apache2", DEFAULT_SERVICE_OPS),
        "mysql": generate_service_ops("mysql", PROTECTED_SERVICE_OPS),
        "sinusbot": generate_service_ops("sinusbot", DEFAULT_SERVICE_OPS),
        "swc_cmd_listener": generate_service_ops("swc_cmd_listener", PROTECTED_SERVICE_OPS)
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
        },
        "vault": {
            "status": lambda: run_as_user("root", "screen -ls | grep vault"),
            "start": lambda: run_as_user("root", "./startvault.sh"),
            "stop": lambda: run_as_user("root", "screen -r swc_vault -X quit")
        }
    }
}


app = Flask(__name__)


@app.route("/power/<cmd>")
def cmd_handler(cmd):
    try:
        return make_response({
            "exit_code": os.system(private_cmds["power"][cmd])
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


@app.route("/")
def index():
    controls = dict()
    for mode, commands in cmds.items():
        controls[mode] = dict()
        for command, ops in commands.items():
            answer = {
                "route": f"/{mode}/{command}/<cmd>"
            }
            if isinstance(ops, dict):
                answer["commands"] = list(ops.keys())
                answer["tester_cmd"] = list(ops.keys()).index("status")
            controls[mode][command] = answer

    ops = ALL_OPS.copy()

    return make_response({
        "controls": controls,
        "ops": ops
    }, 200)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=7556, debug=DEBUG)
