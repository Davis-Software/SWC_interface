from __init__ import app
from user_data.user_auth import auth_required

from sqlalchemy import Column, Integer, String, DateTime
from database.database_connection import database_engine as engine

from flask import request, session
from datetime import datetime


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


@app.route("/server/locator", methods=["GET", "POST"])
@auth_required
def server_locator():
    if request.method == "GET":
        return UserLocation.get()

    if request.method == "POST":
        UserLocation.set(
            session["username"],
            request.form.get("lat"),
            request.form.get("lng"),
            datetime.now()
        )
        return {"success": True}

    return {"error": "Invalid request method"}
