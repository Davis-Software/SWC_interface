from database.connection_profile import ConnectionProfile
from database.sql_type import SQLType

# Flask settings
debug_mode = True                                               # flask debug-mode (ignored for apache wsgi)
secret_key = "put-secret-key-here"                              # flask session secret key


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

cloud_save_path = "E:\\SWC"
public_cloud_folder = "open_cloud"
personal_cloud_folder = "Users"


sync_settings_defaults = {
    "dash_title_img": "background_mc_kelp_underwater_0.png",
    "dash_modules": "cloud_element,news_element,joke_element"
}


dashboard_module_description = {
    "cloud_element": ["Cloud Info", "Shows some info about the files in your cloud"],
    "joke_element": ["Random Joke", "Shows a random joke and lets you vote"],
    "news_element": ["SWC News", "Shows the latest SWC news"],
    "ripple_element": ["Ripple Effect", "Gives you a satisfying ripple effect when clicked"]
}


class CloudFileTypes:
    TEXT = ["", "txt", "py", "css", "js", "asp", "c", "h", "cpp", "cfg", "yml", "json", "url", "lnk", "ts", "scss"]
    ARCHIVE = ["zip", "tar", "gz", "gz2", "tar2", "7z", "rar", "cgx"]
    OPEN_DOCUMENT = ["odt", "ods", "odp"]
    OFFICE_DOCUMENT = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"]
    XHTML = ["html", "xml", "xhtml", "php"]
    MARKDOWN = ["md"]

    IMAGE = ["png", "jpg", "jpeg", "bmp", "gif", "jpeg", "ico", "tiff", "svg"]
    AUDIO = ["mp3", "mp2", "wav", "ogg", "webm"]
    VIDEO = ["mp4"]

    PDF = "pdf"

    ALL = [k for k in locals().keys() if not k.startswith('_')]

    DESCRIPTORS = {     # Descriptions for file types; if none present variable name will be used but converted to lowercase and capitalized
        "FILE": "File",
        "TEXT": "Text File",
        "OFFICE_DOCUMENT": "Office Document",
        "OPEN_DOCUMENT": "Open Document",
        "XHTML": "XML File",
        "MARKDOWN": "Markdown File",
        "IMAGE": "Image File",
        "AUDIO": "Audio File",
        "VIDEO": "Video File",
        "PDF": "Portable Document"
    }

    ICONS = {     # Icons for file types; if none present "insert_drive_file" will be used. Icons: https://material.io/resources/icons/
        "TEXT": "text_snippet",
        "ARCHIVE": "inventory_2",
        "OFFICE_DOCUMENT": "article",
        "OPEN_DOCUMENT": "article",
        "XHTML": "code",
        "MARKDOWN": "integration_instructions",
        "IMAGE": "image",
        "AUDIO": "audiotrack",
        "VIDEO": "movie",
        "PDF": "picture_as_pdf"
    }

    for file_type in ALL:
        if file_type in DESCRIPTORS:
            continue
        DESCRIPTORS[file_type] = file_type.capitalize()


max_upload_size = 8196  # in MB
