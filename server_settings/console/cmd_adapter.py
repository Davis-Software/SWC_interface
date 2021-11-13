import subprocess


def exc_command(cmd: str or list, shell: bool = True):
    return subprocess.check_output(cmd, shell=shell, stderr=subprocess.STDOUT)
