from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from database.database_connection import database_engine as engine

from datetime import datetime


class UserSuspend(engine.Model):
    """
    Represents a suspended user in the database.
    The entry will remain in the database until the account suspension ends.
    """

    __tablename__ = "user_suspends"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    active = Column(Boolean, unique=False)
    infinite = Column(Boolean, unique=False)
    until = Column(DateTime, unique=False)
    message = Column(Text, unique=False)

    def __init__(self, username, until, message):
        self.username = username
        self.active = True
        self.message = message
        if until == -1:
            self.until = datetime.now()
            self.infinite = True
        else:
            self.until = until
