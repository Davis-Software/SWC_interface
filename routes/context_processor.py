from __init__ import *
from datetime import datetime
from utils import string_utils
from user_data import user_repo


@app.context_processor
def processor():
    dictionary = dict(
        account=None,
        user=None,

        app=dict(host=application_host, name=application_name, version=application_version, url=application_url),
        py={
            "len": len,
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
        else:
            return redirect("/login")

    return dictionary
