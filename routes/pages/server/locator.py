from __init__ import app
from user_data.user_auth import is_auth, auth_required

from sqlalchemy import Column, Integer, String, DateTime
from database.database_connection import database_engine as engine

from uuid import uuid4
from hashlib import md5
from functools import wraps
from datetime import datetime
from flask import request, session

from utils.api_utils import no_cors_response


class LocationToken(engine.Model):
    __tablename__ = "user_locations_tokens"

    id = Column(Integer, primary_key=True)
    username = Column(String(150), unique=True)
    token = Column(String(150), unique=True)

    def __init__(self, username: str):
        self.username = username
        self.token = md5(username.encode("utf-8") + str(uuid4()).encode("utf-8")).hexdigest()

    @staticmethod
    def get(username: str):
        token = LocationToken.query.filter_by(username=username).first()
        if token:
            return token.token
        return None

    @staticmethod
    def add(username: str):
        token = LocationToken.query.filter_by(username=username).first()
        if token:
            return token.token
        token = LocationToken(username)
        engine.session.add(token)
        engine.session.commit()
        return token.token

    @staticmethod
    def user_from_token(token: str):
        token = LocationToken.query.filter_by(token=token).first()
        if token:
            return token.username
        return None


class UserLocation(engine.Model):
    __tablename__ = "user_locations"

    id = Column(Integer, primary_key=True)
    username = Column(String(150), unique=True)
    lat = Column(String(50))
    lng = Column(String(50))
    time = Column(DateTime)

    def __init__(self, username: str, lat: str, lng: str, time: datetime):
        self.username = username
        self.lat = lat
        self.lng = lng
        self.time = time

    @staticmethod
    def get():
        user_locations = dict()
        for user in UserLocation.query.all():
            user_locations[user.username] = {
                "lat": user.lat,
                "lng": user.lng,
                "time": user.time.strftime("%d/%m/%Y %H:%M:%S")
            }
        return user_locations

    @staticmethod
    def set(username: str, lat: str, lng: str, time: datetime):
        user = UserLocation.query.filter_by(username=username).first()
        if user:
            user.lat = lat
            user.lng = lng
            user.time = time
        else:
            user = UserLocation(username, lat, lng, time)
            engine.session.add(user)
        engine.session.commit()


def loc_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if is_auth() or LocationToken.get(session["username"]) == request.args.get("token"):
            return func(*args, **kwargs)
        return {"error": "Not authorized"}
    return wrapper


@app.route("/server/locator", methods=["GET", "POST"])
@no_cors_response
@loc_auth
def server_locator():
    user = session.get("username") or LocationToken.user_from_token(request.args.get("token"))

    if not user:
        return {"error": "Not authorized"}

    if request.method == "GET":
        return UserLocation.get()

    if request.method == "POST":
        UserLocation.set(
            user,
            request.form.get("lat") or request.json.get("lat"),
            request.form.get("lng") or request.json.get("lng"),
            datetime.now()
        )
        return {"success": True}

    return {"error": "Invalid request method"}


@app.route("/server/locator/token", methods=["GET"])
@auth_required
def server_locator_token():
    user = session.get("username")

    if not user:
        return {"error": "Not authorized"}

    return {"token": LocationToken.add(user)}
