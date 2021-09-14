from enum import Enum


class SQLType(Enum):
    """
    Represents which database type to connect to.

    You can define which one of them to use in the configuration.py.

    SQLITE - This option has been included mostly for testing
    and development purposes. It is really useful when you don't
    want to set up an extra test DB or run a separate server.
    However, performance of SQLite is rather poor and performance
    tests have shown that as soon as there are more than 500+ plugins,
    the browsing experience will suffer.

    MYSQL - May be harder to set up, but shows drastic performance
    improvements over the previously mentioned db type. When deploying
    this to a procution environment, choosing this option is recommended.

    """

    SQLITE = 1
    MYSQL = 2
