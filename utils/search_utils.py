"""
This file handles the search bars for the page header (general search),
as well as the search bar used to filter plugins on the plugin main page.
"""

from user_data import user_repo


def search_users_by_name(name):
    return user_repo.search_users_by_username(name)


def search_all_by_string(search_string):
    return_list = list()

    class FoundObject:
        def __init__(self, typ, name, link, icon):
            self.type = typ
            self.name = name
            self.link = link
            self.icon = icon

        def export(self):
            return {
                "type": self.type,
                "name": self.name,
                "link": self.link,
                "icon": self.icon
            }


    for user in search_users_by_name(search_string):
        return_list.append(
            FoundObject(
                "user",
                user["username"],
                f"/user/{user['username']}",
                f"/user?avatar={user['username']}"
            )
            .export()
        )

    return return_list
