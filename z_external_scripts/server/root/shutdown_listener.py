import os
from time import sleep

listen_file_location = "/etc/swc/triggers"  # Must be absolute path
listen_file_name = "shutdown"
shutdown_cmd = "/root/stopall.sh start && shutdown now"

listen_file_path = os.path.join(
    listen_file_location,
    listen_file_name
)


def shutdown():
    os.remove(listen_file_path)
    os.system(shutdown_cmd)


def check_file():
    if os.path.exists(listen_file_path):
        return True
    return False


if __name__ == "__main__":
    while True:
        if check_file():
            shutdown()
            break

        sleep(30)
