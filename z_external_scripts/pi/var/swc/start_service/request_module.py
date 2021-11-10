import requests

import service_config


def get_request_url(tags):
    return f"{service_config.swc_server_page_url}?{service_config.request_arg_str}={','.join(tags)}"


def get_tag_config(tags):
    resp = requests.get(
        get_request_url(tags)
    )

    if resp.ok:
        return resp.json()

    return None
