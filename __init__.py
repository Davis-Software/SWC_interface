from flask import *
from flask_cors import CORS
from cryptography.fernet import Fernet
from datetime import timedelta

from utils.request_code import RequestCode
from logger import Logger
from database.global_temp_db import TempDatabase
import configuration
import os

application_host = "software-city.org"
application_url = "dev.software-city.org"
application_name = "SWC Interface"
application_version = "alpha-0.0.1"

working_dir = os.path.dirname(os.path.realpath(__file__))
temp_db = TempDatabase(configuration.temp_db_template)


app = Flask(__name__)
cors = CORS(app)
crypto = Fernet(
    configuration.crypto_key
)
logger = Logger(
    catch_console=not configuration.debug_mode
)

app.secret_key = configuration.secret_key
app.config["MAX_CONTENT_LENGTH"] = configuration.max_upload_size * 1024 * 1024
app.permanent_session_lifetime = timedelta(days=9999)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"


from routes import context_processor
from routes import main_routes, side_routes, user_routes, cloud_routes, admin_routes, auth_routes, error_routes
# from routes.pages import
