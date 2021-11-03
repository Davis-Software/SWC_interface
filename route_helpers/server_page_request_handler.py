from __init__ import render_template


def handle_arguments(request, session):
    return render_template(
        "pages/server.html"
    )
