from sqlalchemy import Column, Integer, String, Text
from database.database_connection import database_engine as engine


class ServerSettings(engine.Model):
    __tablename__ = "server_settings"

    id = Column(Integer, primary_key=True)
    key = Column(String(50), unique=True)
    value = Column(String(200))

    def __init__(self, key: str, value: any):
        self.key = key
        self.value = str(value)


class ButterChurnWeights(engine.Model):
    __tablename__ = "butterchurn_weights"

    id = Column(Integer, primary_key=True)
    key = Column(Text)
    weight = Column(Integer)

    def __init__(self, key: str, weight: int):
        self.key = key
        self.weight = weight
