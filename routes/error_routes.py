from __init__ import *
import configuration
import traceback


def has_all_attributes(obj: object, *args: str) -> bool:
    for arg in args:
        if not hasattr(obj, arg):
            return False
    return True


@app.errorhandler(Exception)
def main_error(error):
    if has_all_attributes(error, "code", "name", "description"):
        return make_response(
            render_template(
                "error_page.html",
                error_code=error.code,
                error=error.name,
                error_traceback=None,
                error_description=error.description
            ),
            error.code
        )

    return make_response(
        render_template(
            "error_page.html",
            error_code="Internal Exception",
            error=type(error).__name__,
            error_traceback=str(traceback.format_exc()).replace("<", "/").replace("\n", "<br>") if configuration.debug_mode else None,
            error_description=error
        ),
        RequestCode.ServerError.InternalServerError
    )
