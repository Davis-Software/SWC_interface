dashboard_module_description = {
    "cloud_element": ["Cloud Info", "Shows some info about the files in your cloud"],
    "joke_element": ["Random Joke", "Shows a random joke and lets you vote"],
    "news_element": ["SWC News", "Shows the latest SWC news"],
    "ripple_element": ["Ripple Effect", "Gives you a satisfying ripple effect when clicked"],
    "pp_calc_element": ["PP Calculator", "Randomize, eh I mean calculates your PP Size"],
    "ts_info_element": ["Teamspeak Users", "Shows you all current users on the SWC Teamspeak Server"],
    "server_ontime_element": ["Server On-Time Info", "Shows you when the server starts-up and shuts-down each day"],
    "mc_info_element": [
        "Minecraft Users", "Shows you all current users on the SWC Minecraft Server", [
            {"mode": "select", "id": "port_select", "desc": "Server Port", "args": [
                ["Main Server", ""],
                ["Mod Server", "1337"]
            ]}
        ]
    ]
}


server_page_modules = {
    "on_time_element": ["Server OnTime Settings", "Configure when the server starts and shuts down for every DOW.", True]
}


class CloudFileTypes:
    TEXT = ["txt", "py", "css", "js", "asp", "c", "h", "cpp", "cfg", "yml", "json", "url", "lnk", "ts", "scss", "bat"]
    ARCHIVE = ["zip", "tar", "gz", "gz2", "tar2", "7z", "rar", "cgx"]
    OPEN_DOCUMENT = ["odt", "ods", "odp"]
    OFFICE_DOCUMENT = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"]
    XHTML = ["html", "xml", "xhtml", "php"]
    MARKDOWN = ["md"]

    IMAGE = ["png", "jpg", "jpeg", "bmp", "gif", "jpeg", "ico", "tiff", "svg"]
    AUDIO = ["mp3", "mp2", "wav", "ogg", "webm"]
    VIDEO = ["mp4"]

    PDF = ["pdf"]

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
