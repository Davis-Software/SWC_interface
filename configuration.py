from database.connection_profile import ConnectionProfile
from database.sql_type import SQLType

# Flask settings
debug_mode = True                                               # flask debug-mode (ignored for apache wsgi)
secret_key = "put-secret-key-here"                              # flask session secret key
crypto_key = b"GDmdPMizO8_aRHVPwYSXcEFnQmvy6EHX48ytFzlsx1E="    # cryptography key for login protection (this is not the real one so don't bother trying anything)


# The Host and Port settings for the webserver
web_host = "0.0.0.0"                         # (ignored for apache)
web_port = 80                                # (ignored for apache)
web_ssl = False                              # (ignored for apache)
ssl_key_file = ""                             # (ignored for apache)
ssl_cert_file = ""                            # (ignored for apache)


# Database Stuff:
# sql dialect and type
sql_dialect = SQLType.SQLITE

# default database

sql_host = '0.0.0.0'                         # (ignored for sqlite)
sql_port = 3306                              # (ignored for sqlite)
sql_database = 'static/db/db.sqlite'         # (path to db file for sqlite)
sql_username = 'user'                        # (ignored for sqlite)
sql_password = 'passwd'                      # (ignored for sqlite)

# extra databases (not used -> ignore)
extra_mysql_databases = {
    'interface': ConnectionProfile(
        'localhost',
        3306,
        'database',
        'flask_user',
        'hello123'
    )
}
# database settings
use_extra_databases = False
connect_database_on_enable = True

temp_db_template = {
    "exposed_cloud_files": {},
    "exposed_cloud_files_positions": {}
}

cloud_save_path = "E:\SWC"
public_cloud_folder = "open_cloud"
personal_cloud_folder = "Users"
max_cloud_size = 10  # in gb

max_upload_size = 8196  # in MB


server_ctrl_port = 7556
