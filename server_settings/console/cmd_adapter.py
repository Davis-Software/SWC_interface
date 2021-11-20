import subprocess


def exc_command(cmd: str or list, shell: bool = True):
    try:
        cmd_result = subprocess.run(
            cmd,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False
        )
        output = str(
            cmd_result.stdout,
            "utf-8"
        )
        return cmd_result.returncode, output
    except Exception as err:
        return 1, str(err)
