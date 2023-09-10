import requests
import configuration


class PowerOptions:
    @staticmethod
    def __base(mode):
        requests.get(f"http://localhost:{configuration.server_ctrl_port}/power/" + mode)

    @staticmethod
    def shutdown():
        PowerOptions.__base("shutdown")

    @staticmethod
    def reboot():
        PowerOptions.__base("reboot")


class SystemOptions:
    @staticmethod
    def wipe_screens():
        requests.get(f"http://localhost:{configuration.server_ctrl_port}/servers/wipe")
