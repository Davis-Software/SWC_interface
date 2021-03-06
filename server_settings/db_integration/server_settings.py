from sqlalchemy import Column, Integer, String
from database.database_connection import database_engine as engine


class ServerSettings(engine.Model):
    __tablename__ = "server_settings"

    id = Column(Integer, primary_key=True)
    key = Column(String(50), unique=True)
    value = Column(String(200))

    def __init__(self, key: str, value: any):
        self.key = key
        self.value = str(value)
