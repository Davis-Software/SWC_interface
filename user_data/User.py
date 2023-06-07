"""
Contains the database model for all users registered on the
website and handles removal of unverified users after a given
amount of time.
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, BLOB, DateTime
from database.database_connection import database_engine as engine

import json
import base64
import datetime
import markdown

from .user_suspend import UserSuspend
from utils import sql_utils


class User(engine.Model):
    """
    Represents a new user in the database/the database model for a user.

    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    password = Column(String(256))
    description = Column(Text(65000), default=" ")
    avatar = Column(BLOB(4000000))
    created = Column(DateTime)
    admin = Column(Boolean, default=False)
    cloud = Column(Boolean, default=True)
    permissions = Column(String(1000), default="[]")
    settings = Column(String(1000), default="{}")

    def __init__(self, username, password, description, avatar, admin=False, cloud=False):
        self.username = username
        self.password = password

        self.description = description
        self.avatar = avatar

        self.created = datetime.datetime.now()

        self.admin = admin
        self.cloud = cloud

        self.permissions = json.dumps([])
        self.settings = json.dumps({})


class SyncingSettings(engine.Model):
    __tablename__ = "syncing_settings"

    db_setting_id = Column(Integer, primary_key=True)
    username = Column(String(50))
    key = Column(String(50))
    value = Column(String(512))

    def __init__(self, username: str, key: str, value: any):
        self.username = username
        self.key = key
        self.value = str(value)


class UserWebQuery:
    def __init__(self, user_model: User or None):

        whitelist = ["id", "username", "password", "description", "avatar", "created", "admin", "cloud", "permissions", "settings"]

        if user_model is None:
            for obj in whitelist:
                setattr(self, obj, None)

        else:
            for obj in dir(user_model):
                if obj not in whitelist:
                    continue
                setattr(self, obj, getattr(user_model, obj))

    def get_json(self):
        return sql_utils.sql_to_json(self)

    def get_id(self) -> int:
        return self.id

    def get_username(self) -> str:
        return self.username

    def get_password(self) -> str:
        return self.password

    def get_email(self) -> str:
        return self.email

    def get_description(self, use_markdown=False) -> str:
        if use_markdown:
            return markdown.markdown(self.description)
        return self.description

    def get_avatar(self, html=False):
        if self.avatar:
            if html:
                return self.avatar
            return f"data:image/png;base64,{base64.b64encode(self.avatar).decode('utf-8')}"
        else:
            if html:
                import os.path as path
                from __init__ import working_dir
                with open(path.join(working_dir, "static/img/empty_user.png"), "rb") as f:
                    return f.read()
            return "/static/img/empty_user.png"

    def get_created(self) -> datetime:
        return self.created

    def get_activation_code(self) -> str:
        return self.activation_code

    def get_activated(self) -> str:
        return self.activated

    def get_admin(self) -> bool:
        return self.admin

    def get_cloud(self) -> bool:
        return self.cloud

    def get_suspended(self) -> bool:
        ban = UserSuspend.query.filter_by(username=self.username).first()
        banned = False
        if ban is not None and ban.active:
            banned = ban.infinite or ban.until > datetime.datetime.now()
            if not banned:
                engine.session.delete(ban)
                engine.session.commit()

        return banned

    def get_suspend_time(self):
        if not self.get_suspended():
            return False
        ban = UserSuspend.query.filter_by(username=self.username).first()
        if ban.infinite:
            return -1
        return ban.until

    def get_suspend_timestamp(self) -> int or bool:
        if not self.get_suspended():
            return False
        ban = UserSuspend.query.filter_by(username=self.username).first()
        if ban.infinite:
            return -1
        return datetime.datetime.timestamp(ban.until)

    def get_suspend_message(self) -> str or bool:
        if not self.get_suspended():
            return False
        return markdown.markdown(UserSuspend.query.filter_by(username=self.username).first().message)

    def get_permissions(self, string: bool = False):
        if string:
            return self.permissions
        return json.loads(self.permissions)

    def get_permission(self, key: str):
        return key in self.get_permissions()

    def get_settings(self, string: bool = False):
        if string:
            return self.settings
        return json.loads(self.settings)

    def get_setting(self, key: str):
        sets = self.get_settings()
        return sets[key] if key in sets else None
