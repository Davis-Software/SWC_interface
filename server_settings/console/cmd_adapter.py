import subprocess

from __init__ import working_dir


def exc_command(cmd: str or list, shell: bool = True):
    try:
        cmd_result = subprocess.run(
            cmd,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            env={"TERM": "xterm-256color"},
            cwd=working_dir
        )
        output = str(
            cmd_result.stdout,
            "UTF-8"
        )
        return cmd_result.returncode, output
    except Exception as err:
        return -420, f"Python error --- {str(err)}"
