"""
This file acts as repository for all users registered on the site
and allows easy access to specific user data and management tools
such as deletion/creation of new users.
"""

import json
import hashlib
import datetime
import configuration

from .User import User, UserWebQuery
from .user_suspend import UserSuspend
from database.database_connection import database_engine as db

from utils import sql_utils


def secure_hash_str(string: str, cycles: int = 30) -> str:
    for i in range(cycles):
        string = hashlib.sha512(bytes(string, "utf-8")).hexdigest()
    return string


def get_user_query_object(user: str) -> UserWebQuery:
    if User.query.filter_by(username=user) is not None:
        return UserWebQuery(User.query.filter_by(username=user).first())
    return UserWebQuery(None)


def get_all_user_query_object() -> list:
    li = list()
    for user in get_all_users():
        li.append(get_user_query_object(user))
    return li


def create_user(username, password, description, avatar, admin=False, cloud=False):
    pwd_hash = secure_hash_str(password)

    user = User(username, pwd_hash, description, avatar, admin=admin, cloud=cloud)

    if User.query.filter_by(username=user.username).first() is None:
        db.session.add(user)
        db.session.commit()
        return True

    return "User already exists"


def delete_user(username):
    user = User.query.filter_by(username=username).first()
    sql_utils.delete_from_db(user)

    sql_utils.commit_db()

    return True


def change_username(name, new_name):
    if User.query.filter_by(username=new_name).first() is None:
        user = User.query.filter_by(username=name).first()
        user.username = new_name
        db.session.commit()
        return True
    return False


def change_description(user, description):
    User.query.filter_by(username=user).first().description = description
    sql_utils.commit_db()


def change_avatar(user, avatar):
    User.query.filter_by(username=user).first().avatar = avatar.stream.read()
    sql_utils.commit_db()


def change_password(user, old, new):
    name = User.query.filter_by(username=user).first()
    if check_user_password(user, old):
        # name.password = hashlib.sha512(bytes(new, "utf-8")).hexdigest()
        name.password = secure_hash_str(new)
        db.session.commit()
        return True
    return False


def set_password(user, password):
    name = User.query.filter_by(username=user).first()
    # name.password = hashlib.sha512(bytes(password, "utf-8")).hexdigest()
    name.password = secure_hash_str(password)
    db.session.commit()
    return True


def get_password_hash(user):
    """
    Gets the hashed password of the given user.

    :param user: The name of the user to get the hashed password of.
    :return: The hashed password of the given user.
    """
    return User.query.filter_by(username=user).first().password


def get_all_users():
    """
    Compiles a list of all currently registered users.

    :return: A list containing all users.
    """
    li = []
    for x in User.query.all():
        li.append(x.username)
    return li


def search_users_by_username(search):
    """
    Searches all users that match the given search
    query as json response string.

    :param search: The search query to check.
    :return: The JSON response containing the search results.
    """
    return sql_utils.sql_list_to_json(
        User.query.filter(User.username.ilike(f"%{search}%")).all()
    )


def user_exists(username):
    """
    Checks if the given user exists.

    :param username: The name of the user to check the existence of.
    :return: True if the input is not None and the user exists in the database.
    """
    return User.query.filter_by(username=username).first() is not None


def check_user_password(user, passwd):
    try:
        # passwd = hashlib.sha512(bytes(passwd, "utf-8")).hexdigest()
        passwd = secure_hash_str(passwd)
        userdata = User.query.filter_by(username=user).first()
        if user is not None and userdata.password == passwd:
            return True
        return False
    except AttributeError:
        return False


def apply_user_settings(user, settings):
    settings = json.loads(settings)
    setts = json.loads(User.query.filter_by(username=user).first().settings)

    for key in settings:
        setts[key] = settings[key]

    User.query.filter_by(username=user).first().settings = json.dumps(setts)
    sql_utils.commit_db()


def check_user_passwordhash(user, pwd_hash):
    """
    This function is used on login to check if the entered password
    for a user is equal to the one stored in the database. The database
    only stores hashed passwords for security reasons, so the password input
    has to be hashed as well before being able to be processed by this function.

    :param user:        The username to check the password of.
    :param pwd_hash:    The hashed password to compare with the database.
    :return: True - if the passwords match and login can be allowed.
             False - if the passwords differ and login should be disallowed.
    """
    try:
        userdata = User.query.filter_by(username=user).first()
        if user is not None and userdata.password == pwd_hash:
            return True
        return False
    except AttributeError:
        return False


def switch_admin(user):
    """
    Toggles admin mode for the given user.
    If the user is not an admin, they will be promoted,
    otherwise they are degraded to a normal user again.

    :param user: The user to toggle admin state of.
    """
    val = User.query.filter_by(username=user).first()
    val.admin = not val.admin
    sql_utils.commit_db()


def suspend_user(user, until, message):
    """
    Suspends a user for a given reason and a given amount of time.

    :param user:    The user to suspend.
    :param until:   If this is -1, the user will be suspended for an infinite
                    amount of time or until they are unbanned again by an admin.
                    If this is bigger than 0, this is the time in milliseconds to
                    suspend this user for.
    :param message:
    :return:
    """
    if int(until) > 0:
        until_fin = datetime.datetime.fromtimestamp(float(until)/1000)
    else:
        until_fin = int(until)
    ban = UserSuspend(user, until_fin, message)
    db.session.add(ban)
    db.session.commit()
    return True


def del_suspend_user(user):
    """
    Deletes a suspension for the given user, so that they are unbanned again.

    :param user: The user you want to unban.
    :return: True - if the process was successful.
    """
    ban = UserSuspend.query.filter_by(username=user).first()
    db.session.delete(ban)
    db.session.commit()
    return True
