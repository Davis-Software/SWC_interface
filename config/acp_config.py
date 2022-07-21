import requests
import configuration

__DATA = requests.get(f"http://localhost:{configuration.server_ctrl_port}").json()

controls = __DATA["controls"]
ops = __DATA["ops"]
