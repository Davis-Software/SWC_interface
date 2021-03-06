from __init__ import *
from datetime import datetime
from utils import string_utils
from user_data import user_repo


@app.context_processor
def processor():
    dictionary = dict(
        account=None,
        user=None,
        user_settings=None,

        app=dict(host=application_host, name=application_name, version=application_version, url=application_url),
        py={
            "len": len,
            "type": type,
            "zip": zip,
            "enum": enumerate,
            "round": round,
            "datetime": datetime,
            "utils": {
                "string": string_utils
            }
        }
    )

    if session.get("logged_in") and session.get("username") is not None:
        username = session.get("username")
        if user_repo.check_user_passwordhash(username, session[username]):
            dictionary["account"] = username
            dictionary["user"] = user_repo.get_user_query_object(username)
            dictionary["user_settings"] = dictionary["user"].get_settings()
            dictionary["user_settings"]["string"] = dictionary["user"].get_settings(string=True)
        else:
            return redirect("/login")

    return dictionary
