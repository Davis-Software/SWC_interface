import subprocess


def exc_command(cmd: str or list, shell: bool = True):
    try:
        output = str(
            subprocess.check_output(cmd, shell=shell, stderr=subprocess.STDOUT),
            "utf-8"
        )
        return 0, output
    except Exception as err:
        return 1, str(err)
