import requests
from flask import make_response

import configuration
from config import acp_config


def call_control_cmd(mode, name, cmd):
    if cmd not in acp_config.controls[mode][name]["commands"]:
        return make_response("Command not found", 400)

    cmd_route = acp_config.controls[mode][name]["route"].replace("<cmd>", cmd)
    resp = requests.get(f"http://localhost:{configuration.server_ctrl_port}{cmd_route}")
    return make_response(
        resp.json() if resp.text else resp.text,
        resp.status_code
    )


def get_controls():
    return acp_config.controls


def get_ops():
    return acp_config.ops
