import json
from os import path
from __init__ import working_dir


class JsonDatabase:
    def __init__(self, beautify: bool) -> None:
        self.file_path = path.join(working_dir, "static/db/db.json")
        self.beautify = beautify
        self.data = None
        self.data_indexes = list()

        self.__template__ = {}

        self.__prepare__(self.file_path, self.__template__)
        self.load()

    def __prepare__(self, file: str, template: dict) -> None:
        if not path.exists(file):
            with open(file, "w") as f:
                f.write(self.json_dumps(template))
        with open(file, "r") as f:
            data = self.json_loads(f.read())
        for key in template:
            if key not in data.keys():
                self.load()
                self.data[key] = template[key]
                self.commit()

    # def __prepare__(self, file: str, template: object) -> None:
    #     self.data = template

    def load(self) -> None:
        with open(self.file_path, "r") as f:
            self.data = self.json_loads(f.read())
            for obj_tuple in self.data.items():
                self.data_indexes.append(obj_tuple[0])
                setattr(self, obj_tuple[0], obj_tuple[1])

    def commit(self) -> None:
        for obj in self.data_indexes:
            self.data[obj] = getattr(self, obj)
        with open(self.file_path, "w") as f:
            f.write(self.json_dumps(self.data))

    # def load(self) -> None:
    #     pass
    #
    # def commit(self) -> None:
    #     pass

    def json_dumps(self, obj: object) -> str:
        """Object like dict to json string"""
        return json.dumps(obj, sort_keys=self.beautify, indent=4)

    def json_loads(self, string: str) -> object:
        """String to json object"""
        return json.loads(string)
