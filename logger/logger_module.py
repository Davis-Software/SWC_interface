import sys
from io import StringIO


class LoggerModule:
    def __init__(self, catch_console: bool):
        self.catch_console = catch_console
        if catch_console:
            sys.stdin = self.console_buffer_input = StringIO()
            sys.stdout = self.console_buffer_output = StringIO()
            sys.stderr = self.console_buffer_error = StringIO()

    def set_console(self, value):
        if not self.catch_console:
            return
        self.console_buffer_input.write(value)

    def get_console(self):
        if self.catch_console:
            return (
                self.console_buffer_input.getvalue(),
                self.console_buffer_output.getvalue(),
                self.console_buffer_error.getvalue()
            )
        return "None"

    def get_console_input(self):
        if self.catch_console:
            return self.console_buffer_input.getvalue()
        return "None"

    def get_console_output(self):
        if self.catch_console:
            return self.console_buffer_output.getvalue()
        return "None"

    def get_console_error(self):
        if self.catch_console:
            return self.console_buffer_error.getvalue()
        return "None"
