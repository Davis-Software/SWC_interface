import os
from flask import Flask, make_response

DEBUG = False

cmds = {
    "shutdown": "/root/stopall.sh start && shutdown now",
    "reboot": "/root/stopall.sh start && reboot"
}


app = Flask(__name__)


@app.route("/power/<cmd>")
def cmd_handler(cmd):
    if cmd in cmds:
        os.system(cmds[cmd])
        return make_response("OK", 200)

    return make_response("Unknown command", 400)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=7556, debug=DEBUG)
