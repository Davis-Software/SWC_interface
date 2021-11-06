import os
import platform

import configuration


class PowerOptions:
    @staticmethod
    def __base(mode):
        if not configuration.debug_mode and platform.system() == "Linux":
            os.system(f"touch {os.path.join(configuration.shutdown_service_trigger_file_location, mode)}")
            return
        print("debug message:", mode)

    @staticmethod
    def shutdown():
        PowerOptions.__base("shutdown")

    @staticmethod
    def restart():
        PowerOptions.__base("restart")
