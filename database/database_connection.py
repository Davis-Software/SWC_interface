from flask_sqlalchemy import SQLAlchemy
from database.connection_profile import ConnectionProfile
from __init__ import app

import configuration


database_engine = SQLAlchemy(app)


def connect_if_required():
    """
    Checks if the server should connect to a database and optionally does so.
    This function automatically connectes to all extra databases attached in the
    config file if enabled.

    :return: True - If connection and authentication to the database was successful.
             False - If database connection was disabled in the config or connection failed.
    """

    print('Initializing Database...')
    if configuration.connect_database_on_enable:
        print("Connection is required on startup! Connecting...")

        # building up connection profile to be able to easily
        # fetch the connection url based on the selected dialect.
        main_profile = ConnectionProfile(
            configuration.sql_host,
            configuration.sql_port,
            configuration.sql_database,
            configuration.sql_username,
            configuration.sql_password
        )

        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = main_profile.connection_uri(configuration.sql_dialect)

        print("Successfully connected to main database!")

        # check if extra db is enabled and there is at least one registered.
        if configuration.use_extra_databases and len(configuration.extra_mysql_databases) != 0:
            print("Extra DB found for connection! Connecting...")
            extra_db = {}

            for key, value in configuration.extra_mysql_databases.items():
                print(f'Fetching connection to extra db for \'{key}\'')
                extra_db[key] = value.connection_uri()

            app.config['SQLALCHEMY_BINDS'] = extra_db

            print(f"Successfully connected to extra DBs!")

        return True
    return False
