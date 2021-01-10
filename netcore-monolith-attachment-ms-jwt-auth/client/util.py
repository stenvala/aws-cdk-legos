import json
import requests
from types import SimpleNamespace


STACK_NAME = 'NetcoreSys-Stack'
URLS = None


def get_value(is_aws, key):
    global URLS
    if URLS == None:
        URLS = get_urls(is_aws)
    return URLS[key]


def get_urls(is_aws):
    file = 'stack-data.json' if is_aws else 'local-data.json'
    with open(file, 'rb') as f:
        data = json.loads(f.read())
        return data[STACK_NAME]


def print_result(response, exit_on_failure=False):
    failed = False
    if response.status_code > 399:
        print('Failed %s' % response.status_code)
        failed = True
    try:
        body = json.loads(response.content)
        print(json.dumps(body, indent=4, sort_keys=True))
    except:
        print(response.content)
    if failed and exit_on_failure:
        exit()
    return body


def login(base, username, password):
    print('Logging in as %s' % username)
    response = requests.post(base + 'api/auth/login', json={
        'username': username,
        'password': password
    })
    if response.status_code != 200:
        print('Cannot log in. Perhaps data base not initialized. Exiting.')
        exit()

    body = json.loads(response.content,
                      object_hook=lambda d: SimpleNamespace(**d))
    return {
        'Authorization': 'Bearer %s,%s' % (body.id, body.sessionId)
    }
