from __init__ import app
from user_data.user_auth import auth_required

from flask import request, session
from datetime import datetime

USER_LOCATIONS = {}


@app.route("/server/locator", methods=["GET", "POST"])
@auth_required
def server_locator():
    if request.method == "GET":
        return USER_LOCATIONS

    if request.method == "POST":
        USER_LOCATIONS[session["username"]] = {
            "lat": request.form.get("lat"),
            "lng": request.form.get("lng"),
            "time": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        }
        return {"success": True}

    return {"error": "Invalid request method"}
