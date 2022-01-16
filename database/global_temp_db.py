class TempDatabase(dict):
    def __init__(self, template: dict = None):
        super().__init__()

        if template is None:
            template = dict()

        for key, val in template.items():
            self[key] = val
