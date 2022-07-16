from flask import render_template

from __init__ import app


@app.route("/acp/api")
def acp_api():
    return render_template("acp/acp_api.html")
