import json
import requests
from types import SimpleNamespace


URLS = None


def get_value(is_aws, key):
    global URLS
    if URLS == None:
        URLS = get_urls(is_aws)
    if key not in URLS:
        return "undefined"
    return URLS[key]


def get_urls(is_aws):
    file = 'stack-data.json' if is_aws else 'local-data.json'
    with open(file, 'r') as f:
        data = json.loads(f.read())        
        stack_name = list(data.keys())[0]
        return data[stack_name]


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
    body = print_result(response)
    return {
        'Authorization': 'Bearer %s,%s' % (body['id'], body['sessionId'])
    }, body['id']
