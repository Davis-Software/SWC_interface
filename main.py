import threading

from __init__ import app, configuration
import database.database_connection as database


if database.connect_if_required():
    database.database_engine.init_app(app)
    database.database_engine.create_all()


def run_schedulers():
    import time
    import schedule
    from server_settings.shutdown_scheduler import set_shutdown_time

    set_shutdown_time()

    while True:
        schedule.run_pending()
        time.sleep(1)


threading.Thread(target=run_schedulers, daemon=True).start()


if __name__ == '__main__':
    if configuration.web_ssl:
        app.run(debug=configuration.debug_mode, host=configuration.web_host, port=configuration.web_port, ssl_context=(configuration.ssl_cert_file, configuration.ssl_key_file))
    else:
        app.run(debug=configuration.debug_mode, host=configuration.web_host, port=configuration.web_port)
