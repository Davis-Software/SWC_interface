from database.sql_type import SQLType


class ConnectionProfile:
    """

    This class represents the credentials needed to connect
    and authorize to an SQL database. This also includes SQLite
    depending on which sql dialect/type is selected when retrieving
    the final connection URL.

    """

    mysql_host = 'localhost'
    mysql_port = 3306
    mysql_database = 'database'
    mysql_username = 'root'
    mysql_password = ''

    def __init__(self, host, port, database, username, password):
        """
        Initializes the login credentials for the database connection.
        It is recommended to simply pass the data provided by configuration.py
        here.

        :param host:        The host where the database is located. (only mandatory for MySQL)
        :param port:        The port under which the database is accessible. (only mandatory for MySQL)
        :param database:    The name of the database to use for table creation. (mandatory for SQLite and MySQL)
                            This name should include the .sqlite file extension when using SQLite.
        :param username:    The user under which name to log in the database (only mandatory for MySQL)
        :param password:    The password to access the given user (only mandatory for MySQL)
        """
        self.mysql_host = host
        self.mysql_port = port
        self.mysql_database = database
        self.mysql_username = username
        self.mysql_password = password
        
    def connection_uri(self, sql_type):
        """
        Builds the URI to connect to the database depending
        on the passed sql type. The URI will be in the following format:

        - sqlite:///databaseName
        - mysql://username:password@host:port/database

        :param sql_type: The database type to build the URL for.
        :return: A string containing the connection URI to connect to a database.
        """
        uri_elements = []
        if sql_type == SQLType.SQLITE:
            uri_elements = [
                'sqlite:///',
                self.mysql_database
            ]
        elif sql_type == SQLType.MYSQL:
            uri_elements = [
                'mysql://',
                self.mysql_username,
                ':',
                self.mysql_password,
                '@',
                self.mysql_host,
                ':',
                self.mysql_port,
                '/',
                self.mysql_database
            ]
        return str(uri_elements) \
            .replace('[', '') \
            .replace(']', '') \
            .replace(',', '') \
            .replace(' ', '') \
            .replace('\'', '')
