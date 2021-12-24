import os
from config import page_config
from __init__ import working_dir


def get_tools(admin=False):
    def make_tool_elem(tool_id, description):
        if description is None:
            description = [tool_id, "No description - Please set one in the interface config/page_config.py file!", False]
        return {
            "id": tool_id,
            "name": description[0],
            "description": description[1],
            "admin": description[2]
        }

    tools = list(map(
        lambda name: name.replace(".html", ""),
        os.listdir(os.path.join(working_dir, "templates/components/tools/toolkit"))
    ))

    module_list = list()
    for tool in tools:
        if not admin and page_config.tools_page_tools.get(tool)[2]:
            continue
        module_list.append(make_tool_elem(
            tool,
            page_config.tools_page_tools.get(tool),
        ))

    return module_list
