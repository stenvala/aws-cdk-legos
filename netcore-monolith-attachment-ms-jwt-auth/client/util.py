import json

STACK_NAME = 'NetcoreSystem-Stack'
PREFIX = 'NetcoreSystem'
URLS = None


def get_value(is_aws, key):
    global URLS
    if URLS == None:
        URLS = get_urls(is_aws)
    if is_aws:
        key = PREFIX + key
    return URLS[key]


def get_urls(is_aws):
    file = 'stack-data.json' if is_aws else 'local-data.json'
    with open(file, 'rb') as f:
        data = json.loads(f.read())
        return data[STACK_NAME]
