controls = {
    "services": {
        "apache2": {
            "route": lambda cmd: f"/service/apache2/{cmd}",
            "commands": ["status", "start", "stop", "restart"],
            "tester_cmd": 0
        },
        "mysql": {
            "route": lambda cmd: f"/service/mysql/{cmd}",
            "commands": ["status", "start", "stop", "restart"],
            "tester_cmd": 0
        }
    },
    "servers": {
        "teamspeak": {
            "route": lambda cmd: f"/servers/teamspeak/{cmd}",
            "commands": ["status", "start", "stop", "restart"],
            "tester_cmd": 0
        },
        "minecraft": {
            "route": lambda cmd: f"/servers/minecraft/{cmd}",
            "commands": ["status", "start", "stop", "restart"],
            "tester_cmd": 0
        },
        "steam": {
            "route": lambda cmd: f"/servers/steam/{cmd}",
            "commands": ["status", "start", "stop", "restart"],
            "tester_cmd": 0
        }
    }
}
