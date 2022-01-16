import subprocess

from __init__ import working_dir, temp_db


def exc_command(cmd: str or list, shell: bool = True):
    if "cmd_executor_cwd" not in temp_db:
        temp_db["cmd_executor_cwd"] = working_dir

    cmd_reader = cmd
    if type(cmd_reader) == str:
        cmd_reader = cmd_reader.split(" ")

    if cmd_reader[0] == "cd":
        if len(cmd_reader) == 1:
            temp_db["cmd_executor_cwd"] = working_dir
        if len(cmd_reader) == 2:
            temp_db["cmd_executor_cwd"] = cmd_reader[1]

    try:
        cmd_result = subprocess.run(
            cmd,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
            env={"TERM": "xterm-256color"},
            cwd=temp_db["cmd_executor_cwd"]
        )
        output = str(
            cmd_result.stdout,
            "UTF-8"
        )
        return cmd_result.returncode, output
    except Exception as err:
        return -420, f"Python error --- {str(err)}"
