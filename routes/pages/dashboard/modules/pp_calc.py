"""
    @author famijoku
"""


import json

from random import randint
from user_data.user_repo import get_user_query_object

LENGTH_RANGE = (-1, 120)
ADMIN_LENGTH_BONUS = 5
RADIUS_RANGE = (0, 10)
DEVIATION_RANGE = (-180, 180)
ALT_DEVIATION_RANGE = (-90, 90)
HARDNESS_RANGE = (0, 10)
HARDNESS_CLOUD_BONUS = 1
DURABILITY_RANGE = (0, 500)
PP_SHAPES = [
    (100, "Tesseract", "Legendary 4-dimensional pp"),
    (99, "Walter White", "jesse we need to cook"),
    (90, "Thy Mother", "circle"),
    (80, "1999 Honda Civic", "car go brrrrr"),
    (70, "Kermit the frog", "*croak*"),
    (60, "Ohio", "Ohio shaped - Not a good shape"),
    (55, "Airplane", "flying f*ck"),
    (40, "Square", "Like a box but in 2D"),
    (0, "Normal", "Nothing special here")
]
VCARD_LEVEL_INF = (30, 50)


class PeePee:
    def __init__(self, username):
        self.user = get_user_query_object(username)

        self.length = 0
        self.radius = 0
        self.deviation = 0
        self.hardness = 0
        self.durability = (0, 0)
        self.shape = PP_SHAPES[0]
        self.v_card = False
        self.level = 0

    def generate_values(self):
        self.__set_random_ranges()
        self.__apply_modifications()
        self.__generate_durability()
        self.__get_vcard_state()
        self.__generate_shape()
        self.__generate_level()

        return self

    def to_json(self):
        out_obj = dict()

        for key in ["length", "radius", "deviation", "hardness", "durability", "shape", "v_card", "level"]:
            out_obj[key] = getattr(self, key)

        return json.loads(json.dumps(out_obj))

    def __set_random_ranges(self):
        self.length = randint(*LENGTH_RANGE)
        self.radius = randint(*RADIUS_RANGE)
        self.deviation = randint(*DEVIATION_RANGE)
        self.hardness = randint(*HARDNESS_RANGE)
        self.v_card = bool(randint(0, 1))

    def __apply_modifications(self):
        if self.user.get_admin():
            self.length += ADMIN_LENGTH_BONUS

        if self.user.get_cloud():
            self.deviation = randint(*ALT_DEVIATION_RANGE)

        if self.user.get_description() not in ["", " "] and self.hardness < HARDNESS_RANGE[1]:
            self.hardness += HARDNESS_CLOUD_BONUS

        if self.user.get_suspended():
            self.length = LENGTH_RANGE[0]
            self.radius = RADIUS_RANGE[0]
            self.deviation = DEVIATION_RANGE[0]
            self.hardness = HARDNESS_RANGE[0]
            self.durability = (0, 0)
            self.v_card = True

    def __generate_shape(self):
        shape_loc = randint(0, 100)

        for i, val in enumerate(PP_SHAPES):
            if val[0] <= shape_loc:
                self.shape = val
                break

    def __generate_durability(self):
        max_durability = randint(*DURABILITY_RANGE)
        current_durability = randint(DURABILITY_RANGE[0], max_durability)

        self.durability = (current_durability, max_durability)

    def __get_vcard_state(self):
        if (self.durability[1] % (self.durability[0] or 1)) % 2 == 0:
            self.v_card = False
        else:
            self.v_card = True

    def __generate_level(self):
        good_max = \
            LENGTH_RANGE[1] + ADMIN_LENGTH_BONUS + \
            RADIUS_RANGE[1] + \
            HARDNESS_RANGE[1] + HARDNESS_CLOUD_BONUS + \
            PP_SHAPES[0][0] + \
            (VCARD_LEVEL_INF[1] if not self.v_card else 0)

        bad_max = \
            (DEVIATION_RANGE[1] if not self.user.get_cloud() else ALT_DEVIATION_RANGE[1]) + \
            (VCARD_LEVEL_INF[1] if self.v_card else 0)

        if self.durability[1] > DURABILITY_RANGE[1] * (2/3):
            good_max += DURABILITY_RANGE[1]
        else:
            bad_max += DURABILITY_RANGE[1]
        if self.durability[0] > self.durability[1] * (2/3):
            good_max += self.durability[1]
        else:
            bad_max += self.durability[1]

        good = \
            self.length + \
            self.radius + \
            self.hardness + \
            self.shape[0] + \
            (VCARD_LEVEL_INF[1] if not self.v_card else 0)

        bad = abs(self.deviation) + (VCARD_LEVEL_INF[1] if self.v_card else 0)

        if self.durability[1] > DURABILITY_RANGE[1] * (2/3):
            good += self.durability[1]
        else:
            bad += self.durability[1]
        if self.durability[0] > self.durability[1] * (2/3):
            good += self.durability[0]
        else:
            bad += self.durability[0]

        lv = (good/bad)/(good_max/bad_max)
        while lv > 10:
            lv /= 10
        while lv < 0:
            lv *= 10

        self.level = round(lv)
