dashboard_module_description = {
    "cloud_element": ["Cloud Info", "Shows some info about the files in your cloud"],
    "joke_element": ["Random Joke", "Shows a random joke and lets you vote"],
    "quote_element": ["Random Quote", "Shows a random quote"],
    "news_element": ["SWC News", "Shows the latest SWC news"],
    "ripple_element": ["Ripple Effect", "Gives you a satisfying ripple effect when clicked"],
    "ts_info_element": ["Teamspeak Users", "Shows you all current users on the SWC Teamspeak Server"],
    "server_ontime_element": ["Server On-Time Info", "Shows you when the server starts-up and shuts-down each day"],
    "mc_info_element": [
        "Minecraft Users",
        "Shows you all current users on the SWC Minecraft Server",
        [
            {
                "mode": "select",
                "id": "port_select",
                "desc": "Server Port",
                "args": [
                    ["Main Server", ""],
                    ["Mod Server", "1337"]
                ]
            }
        ]
    ],
    "pp_calc_element": [
        "PP Calculator",
        "Calculates your PP Size and Level"
    ],
    "minigame_element": [
        "Mini-game",
        "Play a small game on the dashboard", [{
            "mode": "select",
            "id": "game_select",
            "desc": "Game",
            "args": [
                ["Dice", "dice"],
                ["Random game", "random"]
            ]
        }]
    ],
    "15ai_element": [
        "[BROKEN] 15.ai",
        "Generate TF2 & Portal voice-lines /// [BROKEN]: The author of the API has prohibited public access /// This module is deprecated and will be removed in the future",
        []
    ]
}


server_page_modules = {
    "dynmap": ["Software-City MC Map", "Explore Software City's map through a bird's eye view with DynMap.", False],
    "teamspeak": ["Teamspeak Channel Tree", "Get an overview of the software city teamspeak channels.", False],
    "toolbox": ["Software City Toolbox", "Access to some powerful swc tools (access restricted)", False]
}


tools_page_tools = {
    "on_time_element": ["Server OnTime Settings", "Configure when the server starts and shuts down for every DOW.", True],
    "joke_element": ["Joke API Settings", "Manage all jokes in the joke API.", True],
    "quote_element": ["Quote API Settings", "Manage all quotes in the quote API", True],
    "sinusbot": ["Teamspeak Sinusbot Interface", "Select songs the bot should play on the ts server (requires a sinusbot account)", False]
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
